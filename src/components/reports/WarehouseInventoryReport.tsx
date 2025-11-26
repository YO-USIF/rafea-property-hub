import { useState } from "react";
import { useWarehouse } from "@/hooks/useWarehouse";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Printer, Search, Package, AlertTriangle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const WarehouseInventoryReport = () => {
  const { inventory, isLoadingInventory } = useWarehouse();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");

  const categories = Array.from(new Set(inventory.map(item => item.category)));

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = 
      item.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.item_code.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
    
    const matchesStock = 
      stockFilter === "all" ||
      (stockFilter === "low" && item.current_quantity <= item.minimum_quantity) ||
      (stockFilter === "normal" && item.current_quantity > item.minimum_quantity);
    
    return matchesSearch && matchesCategory && matchesStock;
  });

  const totalValue = filteredInventory.reduce(
    (sum, item) => sum + item.current_quantity * item.unit_price,
    0
  );

  const totalQuantity = filteredInventory.reduce(
    (sum, item) => sum + item.current_quantity,
    0
  );

  const lowStockCount = filteredInventory.filter(
    item => item.current_quantity <= item.minimum_quantity
  ).length;

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const printContent = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>تقرير أصناف المستودع</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            padding: 20px;
            direction: rtl;
          }
          .header { 
            text-align: center; 
            margin-bottom: 30px; 
            border-bottom: 3px solid #333;
            padding-bottom: 20px;
          }
          .header h1 { 
            font-size: 28px; 
            margin-bottom: 10px; 
            color: #333;
          }
          .header p { 
            color: #666; 
            font-size: 14px;
          }
          .summary {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 15px;
            margin-bottom: 30px;
          }
          .summary-card {
            background: #f5f5f5;
            padding: 15px;
            border-radius: 8px;
            text-align: center;
          }
          .summary-card h3 {
            font-size: 14px;
            color: #666;
            margin-bottom: 8px;
          }
          .summary-card p {
            font-size: 24px;
            font-weight: bold;
            color: #333;
          }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-top: 20px;
            font-size: 12px;
          }
          th, td { 
            border: 1px solid #ddd; 
            padding: 10px; 
            text-align: right;
          }
          th { 
            background-color: #333; 
            color: white; 
            font-weight: bold;
          }
          tr:nth-child(even) { 
            background-color: #f9f9f9; 
          }
          .low-stock {
            color: #dc2626;
            font-weight: bold;
          }
          .badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 11px;
            background: #e5e7eb;
            color: #374151;
          }
          @media print {
            body { padding: 10px; }
            .summary { page-break-inside: avoid; }
            table { page-break-inside: auto; }
            tr { page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>تقرير أصناف المستودع</h1>
          <p>تاريخ الطباعة: ${new Date().toLocaleDateString('ar-SA')}</p>
          ${categoryFilter !== 'all' ? `<p>التصنيف: ${categoryFilter}</p>` : ''}
          ${stockFilter !== 'all' ? `<p>حالة المخزون: ${stockFilter === 'low' ? 'نواقص' : 'عادي'}</p>` : ''}
        </div>

        <div class="summary">
          <div class="summary-card">
            <h3>إجمالي الأصناف</h3>
            <p>${filteredInventory.length}</p>
          </div>
          <div class="summary-card">
            <h3>قيمة المخزون</h3>
            <p>${totalValue.toLocaleString()} ريال</p>
          </div>
          <div class="summary-card">
            <h3>أصناف نواقص</h3>
            <p class="${lowStockCount > 0 ? 'low-stock' : ''}">${lowStockCount}</p>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>كود الصنف</th>
              <th>اسم الصنف</th>
              <th>التصنيف</th>
              <th>الكمية الحالية</th>
              <th>الحد الأدنى</th>
              <th>الوحدة</th>
              <th>سعر الوحدة</th>
              <th>القيمة الإجمالية</th>
              <th>الموقع</th>
            </tr>
          </thead>
          <tbody>
            ${filteredInventory.map(item => `
              <tr>
                <td>${item.item_code}</td>
                <td>${item.item_name}</td>
                <td><span class="badge">${item.category}</span></td>
                <td class="${item.current_quantity <= item.minimum_quantity ? 'low-stock' : ''}">
                  ${item.current_quantity}
                </td>
                <td>${item.minimum_quantity}</td>
                <td>${item.unit}</td>
                <td>${item.unit_price.toLocaleString()} ريال</td>
                <td>${(item.current_quantity * item.unit_price).toLocaleString()} ريال</td>
                <td>${item.location || '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  if (isLoadingInventory) {
    return (
      <div className="flex items-center justify-center py-12">
        <p>جارٍ تحميل التقرير...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            تقرير أصناف المستودع
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">بحث</Label>
              <div className="relative">
                <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="ابحث بالاسم أو الكود..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>التصنيف</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع التصنيفات</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>حالة المخزون</Label>
              <Select value={stockFilter} onValueChange={setStockFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  <SelectItem value="low">نواقص فقط</SelectItem>
                  <SelectItem value="normal">عادي فقط</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button onClick={handlePrint} className="w-full">
                <Printer className="ml-2 h-4 w-4" />
                طباعة التقرير
              </Button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">إجمالي الأصناف</p>
                    <p className="text-2xl font-bold">{filteredInventory.length}</p>
                  </div>
                  <Package className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">قيمة المخزون</p>
                    <p className="text-2xl font-bold">{totalValue.toLocaleString()} ريال</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={lowStockCount > 0 ? "border-destructive" : ""}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">أصناف نواقص</p>
                    <p className={`text-2xl font-bold ${lowStockCount > 0 ? 'text-destructive' : ''}`}>
                      {lowStockCount}
                    </p>
                  </div>
                  <AlertTriangle className={`h-8 w-8 ${lowStockCount > 0 ? 'text-destructive' : 'text-muted-foreground'}`} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Table */}
          <div className="overflow-x-auto border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>كود الصنف</TableHead>
                  <TableHead>اسم الصنف</TableHead>
                  <TableHead>التصنيف</TableHead>
                  <TableHead>الكمية الحالية</TableHead>
                  <TableHead>الحد الأدنى</TableHead>
                  <TableHead>الوحدة</TableHead>
                  <TableHead>سعر الوحدة</TableHead>
                  <TableHead>القيمة الإجمالية</TableHead>
                  <TableHead>الموقع</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInventory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      لا توجد أصناف تطابق معايير البحث
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInventory.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.item_code}</TableCell>
                      <TableCell>{item.item_name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <span
                          className={
                            item.current_quantity <= item.minimum_quantity
                              ? "text-destructive font-bold flex items-center gap-1"
                              : ""
                          }
                        >
                          {item.current_quantity <= item.minimum_quantity && (
                            <AlertTriangle className="h-4 w-4" />
                          )}
                          {item.current_quantity}
                        </span>
                      </TableCell>
                      <TableCell>{item.minimum_quantity}</TableCell>
                      <TableCell>{item.unit}</TableCell>
                      <TableCell>{item.unit_price.toLocaleString()} ريال</TableCell>
                      <TableCell className="font-semibold">
                        {(item.current_quantity * item.unit_price).toLocaleString()} ريال
                      </TableCell>
                      <TableCell>{item.location || "-"}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
