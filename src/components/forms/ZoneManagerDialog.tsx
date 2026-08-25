import { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Layers, Search, Link2, Unlink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ZoneProject {
  id: string;
  name: string;
  location: string;
  zone?: string | null;
}

interface ZoneManagerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projects: ZoneProject[];
  onSuccess: () => void;
}

const ZoneManagerDialog = ({ open, onOpenChange, projects, onSuccess }: ZoneManagerDialogProps) => {
  const { toast } = useToast();
  const [zoneName, setZoneName] = useState('');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const zones = useMemo(() => {
    const map: Record<string, number> = {};
    projects.forEach((p) => {
      const z = (p.zone || '').trim();
      if (z) map[z] = (map[z] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => a[0].localeCompare(b[0]));
  }, [projects]);

  useEffect(() => {
    if (open) {
      setZoneName('');
      setSearch('');
      setSelected([]);
    }
  }, [open]);

  // عند اختيار نطاق موجود، حدد مشاريعه تلقائياً
  const pickZone = (z: string) => {
    setZoneName(z);
    setSelected(projects.filter((p) => (p.zone || '').trim() === z).map((p) => p.id));
  };

  const filtered = projects.filter((p) => {
    const term = search.trim().toLowerCase();
    return !term || p.name.toLowerCase().includes(term) || (p.location || '').toLowerCase().includes(term);
  });

  const toggle = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleSave = async () => {
    const z = zoneName.trim();
    if (!z) {
      toast({ title: 'أدخل اسم النطاق', variant: 'destructive' });
      return;
    }
    if (selected.length === 0) {
      toast({ title: 'اختر مشروعاً واحداً على الأقل لربطه بالنطاق', variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
      // ربط المشاريع المحددة بالنطاق
      const { error } = await supabase.from('projects').update({ zone: z }).in('id', selected);
      if (error) throw error;

      // فك ارتباط المشاريع التي كانت ضمن النطاق ولم تعد محددة
      const removed = projects
        .filter((p) => (p.zone || '').trim() === z && !selected.includes(p.id))
        .map((p) => p.id);
      if (removed.length > 0) {
        const { error: err2 } = await supabase.from('projects').update({ zone: null }).in('id', removed);
        if (err2) throw err2;
      }

      toast({ title: `تم حفظ النطاق ${z}`, description: `عدد المشاريع المرتبطة: ${selected.length}` });
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({ title: 'خطأ في حفظ النطاق', description: error.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-primary" />
            إدارة النطاقات وربط المشاريع
          </DialogTitle>
          <DialogDescription>
            أنشئ نطاقاً جديداً أو اختر نطاقاً حالياً، ثم حدد المشاريع المرتبطة به. تُوزَّع تكاليف النطاق بالتساوي على مشاريعه.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>النطاقات الحالية</Label>
            {zones.length === 0 ? (
              <p className="text-sm text-muted-foreground">لا توجد نطاقات بعد</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {zones.map(([z, count]) => (
                  <Badge
                    key={z}
                    variant={zoneName.trim() === z ? 'default' : 'outline'}
                    className="cursor-pointer text-sm py-1 px-3"
                    onClick={() => pickZone(z)}
                  >
                    {z} · {count} مشروع
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="zoneName">اسم النطاق</Label>
            <Input
              id="zoneName"
              value={zoneName}
              onChange={(e) => setZoneName(e.target.value)}
              placeholder="مثال: ZONE1، ZONE2، ZONE3 ..."
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>المشاريع المرتبطة ({selected.length})</Label>
              <div className="relative w-56">
                <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="بحث عن مشروع..."
                  className="pr-8 h-9"
                />
              </div>
            </div>

            <ScrollArea className="h-72 rounded-md border">
              <div className="divide-y">
                {filtered.map((p) => {
                  const currentZone = (p.zone || '').trim();
                  const checked = selected.includes(p.id);
                  return (
                    <label
                      key={p.id}
                      className="flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/50"
                    >
                      <Checkbox checked={checked} onCheckedChange={() => toggle(p.id)} />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{p.name}</div>
                        <div className="text-xs text-muted-foreground truncate">{p.location}</div>
                      </div>
                      {currentZone ? (
                        <Badge variant="secondary" className="gap-1">
                          <Link2 className="w-3 h-3" />
                          {currentZone}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="gap-1 text-muted-foreground">
                          <Unlink className="w-3 h-3" />
                          بدون نطاق
                        </Badge>
                      )}
                    </label>
                  );
                })}
                {filtered.length === 0 && (
                  <div className="p-6 text-center text-sm text-muted-foreground">لا توجد مشاريع مطابقة</div>
                )}
              </div>
            </ScrollArea>
            <p className="text-xs text-muted-foreground">
              إلغاء تحديد مشروع كان ضمن هذا النطاق سيفك ارتباطه به.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            إلغاء
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'جارٍ الحفظ...' : 'حفظ النطاق'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ZoneManagerDialog;
