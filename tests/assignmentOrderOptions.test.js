import { describe, expect, it } from 'bun:test';
import { assignmentOrderContractorNames } from '../src/lib/assignmentOrderOptions.ts';

describe('assignment order contractor preservation', () => {
  it('keeps a manually entered daily-labour contractor when editing', () => {
    expect(assignmentOrderContractorNames('مقاول يومية محفوظ', ['عماله خارجية باليومية']))
      .toEqual(['مقاول يومية محفوظ', 'عماله خارجية باليومية']);
  });

  it('keeps the saved contractor while the catalogue is empty', () => {
    expect(assignmentOrderContractorNames('المقاول المحفوظ', []))
      .toEqual(['المقاول المحفوظ']);
  });

  it('does not duplicate a saved contractor in the catalogue', () => {
    expect(assignmentOrderContractorNames('المقاول المحفوظ', ['المقاول المحفوظ', 'مقاول آخر']))
      .toEqual(['المقاول المحفوظ', 'مقاول آخر']);
  });
});