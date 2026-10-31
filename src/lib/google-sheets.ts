import { nextDocumentNumber, withNumberingLock } from './document-numbering';
import { calculateStatistics } from './statistics';
﻿import { google } from 'googleapis';
import {
  VanBanDen,
  VanBanDi,
  DanhMucItem,
  ThongKeItem,
  CauHinhItem,
  DashboardStats,
} from './types';
import {
  INITIAL_MOCK_VAN_BAN_DEN,
  INITIAL_MOCK_VAN_BAN_DI,
  INITIAL_MOCK_DANH_MUC,
  INITIAL_MOCK_THONG_KE,
  INITIAL_MOCK_CAU_HINH,
} from './mock-data';
import { generateDocumentId } from './utils';

// Biến lưu trữ tạm trên bộ nhớ khi chưa cấu hình Google Service Account
let inMemoryVanBanDen: VanBanDen[] = [...INITIAL_MOCK_VAN_BAN_DEN];
let inMemoryVanBanDi: VanBanDi[] = [...INITIAL_MOCK_VAN_BAN_DI];
const inMemoryDanhMuc: DanhMucItem[] = [...INITIAL_MOCK_DANH_MUC];
const inMemoryThongKe: ThongKeItem[] = [...INITIAL_MOCK_THONG_KE];
const inMemoryCauHinh: CauHinhItem[] = [...INITIAL_MOCK_CAU_HINH];

const DATABASE_ID = process.env.DOCFLOW_DATABASE_ID || '1LX5rXm81Mnm_sQcjXVzVGLFmD4LICuLCvnbzV3pf-zY';
const SYSTEM_ID = process.env.DOCFLOW_SYSTEM_ID || '1tDAYBobgTBcCg61H0LieZvTbk-MDsZDhYvQtqW_oWQc';

/**
 * Kiểm tra xem cấu hình Google Service Account đã được cung cấp chưa
 */
export function isGoogleCredentialsConfigured(): boolean {
  if (Boolean(process.env.GOOGLE_CLIENT_EMAIL?.trim()) !== Boolean(process.env.GOOGLE_PRIVATE_KEY?.trim())) {
    throw new Error('Cần cấu hình đầy đủ email và private key của Service Account.');
  }
  return !!(
    process.env.GOOGLE_CLIENT_EMAIL &&
    process.env.GOOGLE_PRIVATE_KEY &&
    process.env.GOOGLE_CLIENT_EMAIL.trim() !== '' &&
    process.env.GOOGLE_PRIVATE_KEY.trim() !== ''
  );
}

/**
 * Tạo Google Sheets Client đã xác thực qua Service Account
 */
function getGoogleSheetsClient() {
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  let privateKey = process.env.GOOGLE_PRIVATE_KEY;

  if (!clientEmail || !privateKey) {
    throw new Error('Chưa cấu hình GOOGLE_CLIENT_EMAIL hoặc GOOGLE_PRIVATE_KEY');
  }

  // Xử lý xuống dòng trong Private Key nếu được escape qua biến môi trường
  privateKey = privateKey
    .replace(/^["']+|["']+$/g, '')
    .replace(/\\n/g, '\n');

  const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  return google.sheets({ version: 'v4', auth });
}

// ==============================================================================
// 1. QUẢN LÝ VĂN BẢN ĐẾN (Sheet: VAN_BAN_DEN - 21 cột)
// ==============================================================================

/**
 * Chuyển đổi một dòng dữ liệu từ Google Sheets thành đối tượng VanBanDen
 */
function rowToVanBanDen(row: any[]): VanBanDen {
  return {
    id: String(row[0] || ''),
    nam: Number(row[1]) || new Date().getFullYear(),
    so_den: Number(row[2]) || 0,
    ngay_den: String(row[3] || ''),
    so_ky_hieu: String(row[4] || ''),
    ngay_ban_hanh: String(row[5] || ''),
    co_quan_gui: String(row[6] || ''),
    loai_van_ban: String(row[7] || ''),
    trich_yeu: String(row[8] || ''),
    lanh_dao_chi_dao: String(row[9] || ''),
    nguoi_xu_ly: String(row[10] || ''),
    noi_dung_chi_dao: String(row[11] || ''),
    han_xu_ly: String(row[12] || ''),
    trang_thai: (row[13] || 'Chưa xử lý') as any,
    ngay_hoan_thanh: String(row[14] || ''),
    ket_qua_xu_ly: String(row[15] || ''),
    muc_do_uu_tien: (row[16] || 'Thường') as any,
    link_dinh_kem: String(row[17] || ''),
    ghi_chu: String(row[18] || ''),
    ngay_tao: String(row[19] || ''),
    ngay_cap_nhat: String(row[20] || ''),
  };
}

/**
 * Chuyển đổi đối tượng VanBanDen thành mảng 21 phần tử để ghi vào Google Sheets
 */
function vanBanDenToRow(doc: VanBanDen): any[] {
  return [
    doc.id,
    doc.nam,
    doc.so_den,
    doc.ngay_den,
    doc.so_ky_hieu,
    doc.ngay_ban_hanh,
    doc.co_quan_gui,
    doc.loai_van_ban,
    doc.trich_yeu,
    doc.lanh_dao_chi_dao,
    doc.nguoi_xu_ly,
    doc.noi_dung_chi_dao,
    doc.han_xu_ly,
    doc.trang_thai,
    doc.ngay_hoan_thanh,
    doc.ket_qua_xu_ly,
    doc.muc_do_uu_tien,
    doc.link_dinh_kem,
    doc.ghi_chu,
    doc.ngay_tao,
    doc.ngay_cap_nhat,
  ];
}

/**
 * Lấy danh sách toàn bộ văn bản đến
 */
export async function getVanBanDenList(): Promise<{ data: VanBanDen[]; isDemo: boolean }> {
  if (!isGoogleCredentialsConfigured()) {
    return { data: inMemoryVanBanDen, isDemo: true };
  }

  try {
    const sheets = getGoogleSheetsClient();
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: DATABASE_ID,
      range: 'VAN_BAN_DEN!A2:U',
    });

    const rows = res.data.values || [];
    const list: VanBanDen[] = rows
      .filter((r) => r && r[0]) // Bỏ qua dòng trống không có ID
      .map(rowToVanBanDen);

    return { data: list, isDemo: false };
  } catch (error) {
    console.warn('Google Sheets request failed');
    throw new Error('Không thể đọc Google Sheets. Vui lòng thử lại; dữ liệu chưa được lưu vào chế độ demo.');
  }
}

/**
 * Thêm một văn bản đến mới
 */
async function addVanBanDenUnlocked(
  docData: Omit<VanBanDen, 'id' | 'ngay_tao' | 'ngay_cap_nhat'>
): Promise<{ success: boolean; data?: VanBanDen; message?: string }> {
  const currentListRes = await getVanBanDenList();
  const list = currentListRes.data;

  docData = { ...docData, so_den: nextDocumentNumber(list, Number(docData.nam), 'so_den') };
  // Kiểm tra trùng số đến trong cùng một năm
  const isDuplicate = list.some(
    (item) => Number(item.nam) === Number(docData.nam) && Number(item.so_den) === Number(docData.so_den)
  );

  if (isDuplicate) {
    return {
      success: false,
      message: `Số đến ${docData.so_den} đã tồn tại trong năm ${docData.nam}. Vui lòng kiểm tra lại.`,
    };
  }

  const nowIso = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const newDoc: VanBanDen = {
    ...docData,
    id: generateDocumentId('VBD', docData.nam),
    ngay_tao: nowIso,
    ngay_cap_nhat: nowIso,
  };

  if (!isGoogleCredentialsConfigured() || currentListRes.isDemo) {
    inMemoryVanBanDen.unshift(newDoc);
    return { success: true, data: newDoc };
  }

  try {
    const sheets = getGoogleSheetsClient();
    const rowValues = vanBanDenToRow(newDoc);

    await sheets.spreadsheets.values.append({
      spreadsheetId: DATABASE_ID,
      range: 'VAN_BAN_DEN!A2:U',
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: [rowValues],
      },
    });

    return { success: true, data: newDoc };
  } catch (error: any) {
    console.error('Google Sheets request failed');
    return {
      success: false,
      message: 'Không thể ghi dữ liệu vào Google Sheets. Vui lòng kiểm tra quyền chia sẻ.',
    };
  }
}

/**
 * Cập nhật một văn bản đến
 */
async function updateVanBanDenUnlocked(
  id: string,
  docData: Partial<VanBanDen>
): Promise<{ success: boolean; data?: VanBanDen; message?: string }> {
  const currentListRes = await getVanBanDenList();
  const list = currentListRes.data;
  const existingIndex = list.findIndex((d) => d.id === id);

  if (existingIndex === -1) {
    return { success: false, message: 'Không tìm thấy văn bản đến cần sửa.' };
  }

  const existing = list[existingIndex];

  // Kiểm tra trùng số đến nếu thay đổi số đến hoặc năm
  const targetNam = docData.nam !== undefined ? Number(docData.nam) : Number(existing.nam);
  const targetSoDen = targetNam === Number(existing.nam) ? Number(existing.so_den) : nextDocumentNumber(list, targetNam, 'so_den');

  const isDuplicate = list.some(
    (item) => item.id !== id && Number(item.nam) === targetNam && Number(item.so_den) === targetSoDen
  );

  if (isDuplicate) {
    return {
      success: false,
      message: `Số đến ${targetSoDen} đã tồn tại trong năm ${targetNam}.`,
    };
  }

  const nowIso = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const updatedDoc: VanBanDen = {
    ...existing,
    ...docData,
    id: existing.id, // Đảm bảo ID không thay đổi
    nam: targetNam,
    so_den: targetSoDen,
    ngay_cap_nhat: nowIso,
  };

  if (!isGoogleCredentialsConfigured() || currentListRes.isDemo) {
    inMemoryVanBanDen = inMemoryVanBanDen.map((d) => (d.id === id ? updatedDoc : d));
    return { success: true, data: updatedDoc };
  }

  try {
    const sheets = getGoogleSheetsClient();
    // Đọc cột A để xác định chính xác số thứ tự dòng chứa ID
    const colARes = await sheets.spreadsheets.values.get({
      spreadsheetId: DATABASE_ID,
      range: 'VAN_BAN_DEN!A:A',
    });

    const colA = colARes.data.values || [];
    let targetRowIndex = -1;

    for (let i = 0; i < colA.length; i++) {
      if (colA[i] && colA[i][0] === id) {
        targetRowIndex = i + 1; // Chỉ số 1-indexed trong Sheets
        break;
      }
    }

    if (targetRowIndex === -1) {
      return { success: false, message: 'Không tìm thấy dòng tương ứng trên Google Sheets.' };
    }

    const rowValues = vanBanDenToRow(updatedDoc);
    await sheets.spreadsheets.values.update({
      spreadsheetId: DATABASE_ID,
      range: `VAN_BAN_DEN!A${targetRowIndex}:U${targetRowIndex}`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [rowValues],
      },
    });

    return { success: true, data: updatedDoc };
  } catch (error: any) {
    console.error('Google Sheets request failed');
    return { success: false, message: 'Lỗi khi cập nhật Google Sheets.' };
  }
}

/**
 * Xóa một văn bản đến
 */
export async function deleteVanBanDen(id: string): Promise<{ success: boolean; message?: string }> {
  if (!isGoogleCredentialsConfigured()) {
    inMemoryVanBanDen = inMemoryVanBanDen.filter((d) => d.id !== id);
    return { success: true };
  }

  try {
    const sheets = getGoogleSheetsClient();
    const colARes = await sheets.spreadsheets.values.get({
      spreadsheetId: DATABASE_ID,
      range: 'VAN_BAN_DEN!A:A',
    });

    const colA = colARes.data.values || [];
    let targetRowIndex = -1;

    for (let i = 0; i < colA.length; i++) {
      if (colA[i] && colA[i][0] === id) {
        targetRowIndex = i + 1;
        break;
      }
    }

    if (targetRowIndex === -1) {
      return { success: false, message: 'Không tìm thấy văn bản trên Google Sheets.' };
    }

    // Xóa nội dung dòng bằng clear để an toàn tuyệt đối
    await sheets.spreadsheets.values.clear({
      spreadsheetId: DATABASE_ID,
      range: `VAN_BAN_DEN!A${targetRowIndex}:U${targetRowIndex}`,
    });

    return { success: true };
  } catch (error: any) {
    console.error('Google Sheets request failed');
    return { success: false, message: 'Không thể xóa trên Google Sheets. Vui lòng thử lại.' };
  }
}

// ==============================================================================
// 2. QUẢN LÝ VĂN BẢN ĐI (Sheet: VAN_BAN_DI - 18 cột)
// ==============================================================================

function rowToVanBanDi(row: any[]): VanBanDi {
  return {
    id: String(row[0] || ''),
    nam: Number(row[1]) || new Date().getFullYear(),
    so_di: Number(row[2]) || 0,
    ngay_phat_hanh: String(row[3] || ''),
    so_ky_hieu: String(row[4] || ''),
    ngay_ky: String(row[5] || ''),
    loai_van_ban: String(row[7 - 1] || ''),
    trich_yeu: String(row[8 - 1] || ''),
    don_vi_soan_thao: String(row[9 - 1] || ''),
    nguoi_ky: String(row[10 - 1] || ''),
    chuc_vu_nguoi_ky: String(row[11 - 1] || ''),
    noi_nhan: String(row[12 - 1] || ''),
    hinh_thuc_gui: String(row[13 - 1] || ''),
    trang_thai: (row[14 - 1] || 'Đã phát hành') as any,
    link_dinh_kem: String(row[15 - 1] || ''),
    ghi_chu: String(row[16 - 1] || ''),
    ngay_tao: String(row[17 - 1] || ''),
    ngay_cap_nhat: String(row[18 - 1] || ''),
  };
}

function vanBanDiToRow(doc: VanBanDi): any[] {
  return [
    doc.id,
    doc.nam,
    doc.so_di || '',
    doc.ngay_phat_hanh,
    doc.so_ky_hieu,
    doc.ngay_ky,
    doc.loai_van_ban,
    doc.trich_yeu,
    doc.don_vi_soan_thao,
    doc.nguoi_ky,
    doc.chuc_vu_nguoi_ky,
    doc.noi_nhan,
    doc.hinh_thuc_gui,
    doc.trang_thai,
    doc.link_dinh_kem,
    doc.ghi_chu,
    doc.ngay_tao,
    doc.ngay_cap_nhat,
  ];
}

export async function getVanBanDiList(): Promise<{ data: VanBanDi[]; isDemo: boolean }> {
  if (!isGoogleCredentialsConfigured()) {
    return { data: inMemoryVanBanDi, isDemo: true };
  }

  try {
    const sheets = getGoogleSheetsClient();
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: DATABASE_ID,
      range: 'VAN_BAN_DI!A2:R',
    });

    const rows = res.data.values || [];
    const list: VanBanDi[] = rows
      .filter((r) => r && r[0])
      .map(rowToVanBanDi);

    return { data: list, isDemo: false };
  } catch (error) {
    console.warn('Google Sheets request failed');
    throw new Error('Không thể đọc Google Sheets. Vui lòng thử lại; dữ liệu chưa được lưu vào chế độ demo.');
  }
}

async function addVanBanDiUnlocked(
  docData: Omit<VanBanDi, 'id' | 'ngay_tao' | 'ngay_cap_nhat'>
): Promise<{ success: boolean; data?: VanBanDi; message?: string }> {
  const currentListRes = await getVanBanDiList();
  const list = currentListRes.data;

  docData = { ...docData, so_di: docData.trang_thai === 'Đã phát hành' ? nextDocumentNumber(list, Number(docData.nam), 'so_di') : 0 };
  // Kiểm tra trùng số đi trong cùng một năm
  const isDuplicate = list.some(
    (item) => Number(docData.so_di) > 0 && Number(item.nam) === Number(docData.nam) && Number(item.so_di) === Number(docData.so_di)
  );

  if (isDuplicate) {
    return {
      success: false,
      message: `Số đi ${docData.so_di} đã tồn tại trong năm ${docData.nam}. Vui lòng kiểm tra lại.`,
    };
  }

  const nowIso = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const newDoc: VanBanDi = {
    ...docData,
    id: generateDocumentId('VBDI', docData.nam),
    ngay_tao: nowIso,
    ngay_cap_nhat: nowIso,
  };

  if (!isGoogleCredentialsConfigured() || currentListRes.isDemo) {
    inMemoryVanBanDi.unshift(newDoc);
    return { success: true, data: newDoc };
  }

  try {
    const sheets = getGoogleSheetsClient();
    const rowValues = vanBanDiToRow(newDoc);

    await sheets.spreadsheets.values.append({
      spreadsheetId: DATABASE_ID,
      range: 'VAN_BAN_DI!A2:R',
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: [rowValues],
      },
    });

    return { success: true, data: newDoc };
  } catch (error: any) {
    console.error('Google Sheets request failed');
    return {
      success: false,
      message: 'Không thể ghi dữ liệu vào Google Sheets.',
    };
  }
}

async function updateVanBanDiUnlocked(
  id: string,
  docData: Partial<VanBanDi>
): Promise<{ success: boolean; data?: VanBanDi; message?: string }> {
  const currentListRes = await getVanBanDiList();
  const list = currentListRes.data;
  const existingIndex = list.findIndex((d) => d.id === id);

  if (existingIndex === -1) {
    return { success: false, message: 'Không tìm thấy văn bản đi cần sửa.' };
  }

  const existing = list[existingIndex];

  const targetNam = docData.nam !== undefined ? Number(docData.nam) : Number(existing.nam);
  const targetSoDi = Number(existing.so_di) > 0 && targetNam === Number(existing.nam) ? Number(existing.so_di) : (docData.trang_thai ?? existing.trang_thai) === 'Đã phát hành' ? nextDocumentNumber(list, targetNam, 'so_di') : 0;

  const isDuplicate = list.some(
    (item) => targetSoDi > 0 && item.id !== id && Number(item.nam) === targetNam && Number(item.so_di) === targetSoDi
  );

  if (isDuplicate) {
    return {
      success: false,
      message: `Số đi ${targetSoDi} đã tồn tại trong năm ${targetNam}.`,
    };
  }

  const nowIso = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const updatedDoc: VanBanDi = {
    ...existing,
    ...docData,
    id: existing.id,
    nam: targetNam,
    so_di: targetSoDi,
    ngay_cap_nhat: nowIso,
  };

  if (!isGoogleCredentialsConfigured() || currentListRes.isDemo) {
    inMemoryVanBanDi = inMemoryVanBanDi.map((d) => (d.id === id ? updatedDoc : d));
    return { success: true, data: updatedDoc };
  }

  try {
    const sheets = getGoogleSheetsClient();
    const colARes = await sheets.spreadsheets.values.get({
      spreadsheetId: DATABASE_ID,
      range: 'VAN_BAN_DI!A:A',
    });

    const colA = colARes.data.values || [];
    let targetRowIndex = -1;

    for (let i = 0; i < colA.length; i++) {
      if (colA[i] && colA[i][0] === id) {
        targetRowIndex = i + 1;
        break;
      }
    }

    if (targetRowIndex === -1) {
      return { success: false, message: 'Không tìm thấy dòng tương ứng trên Google Sheets.' };
    }

    const rowValues = vanBanDiToRow(updatedDoc);
    await sheets.spreadsheets.values.update({
      spreadsheetId: DATABASE_ID,
      range: `VAN_BAN_DI!A${targetRowIndex}:R${targetRowIndex}`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [rowValues],
      },
    });

    return { success: true, data: updatedDoc };
  } catch (error: any) {
    console.error('Google Sheets request failed');
    return { success: false, message: 'Lỗi khi cập nhật Google Sheets.' };
  }
}

export async function deleteVanBanDi(id: string): Promise<{ success: boolean; message?: string }> {
  if (!isGoogleCredentialsConfigured()) {
    inMemoryVanBanDi = inMemoryVanBanDi.filter((d) => d.id !== id);
    return { success: true };
  }

  try {
    const sheets = getGoogleSheetsClient();
    const colARes = await sheets.spreadsheets.values.get({
      spreadsheetId: DATABASE_ID,
      range: 'VAN_BAN_DI!A:A',
    });

    const colA = colARes.data.values || [];
    let targetRowIndex = -1;

    for (let i = 0; i < colA.length; i++) {
      if (colA[i] && colA[i][0] === id) {
        targetRowIndex = i + 1;
        break;
      }
    }

    if (targetRowIndex === -1) {
      inMemoryVanBanDi = inMemoryVanBanDi.filter((d) => d.id !== id);
      return { success: true };
    }

    await sheets.spreadsheets.values.clear({
      spreadsheetId: DATABASE_ID,
      range: `VAN_BAN_DI!A${targetRowIndex}:R${targetRowIndex}`,
    });

    return { success: true };
  } catch (error: any) {
    console.error('Google Sheets request failed');
    return { success: false, message: 'Không thể xóa trên Google Sheets. Vui lòng thử lại.' };
  }
}

// ==============================================================================
// 3. FILE DOCFLOW_SYSTEM (DANH_MUC, THONG_KE, CAU_HINH)
// ==============================================================================

export async function getDanhMucList(): Promise<{ data: DanhMucItem[]; isDemo: boolean }> {
  if (!isGoogleCredentialsConfigured()) {
    return { data: inMemoryDanhMuc, isDemo: true };
  }

  try {
    const sheets = getGoogleSheetsClient();
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SYSTEM_ID,
      range: 'DANH_MUC!A2:D',
    });

    const rows = res.data.values || [];
    const list: DanhMucItem[] = rows
      .filter((r) => r && r[0])
      .map((r) => ({
        nhom_danh_muc: String(r[0] || ''),
        ma: String(r[1] || ''),
        ten_gia_tri: String(r[2] || ''),
        ghi_chu: String(r[3] || ''),
      }));

    return { data: list, isDemo: false };
  } catch (error) {
    console.warn('Google Sheets request failed');
    throw new Error('Không thể đọc Google Sheets. Vui lòng thử lại; dữ liệu chưa được lưu vào chế độ demo.');
  }
}

export async function updateDanhMucItem(
  original: Pick<DanhMucItem, 'nhom_danh_muc' | 'ma'>,
  updates: DanhMucItem
): Promise<{ success: boolean; data?: DanhMucItem; message?: string }> {
  if (!isGoogleCredentialsConfigured()) {
    const index = inMemoryDanhMuc.findIndex(
      (item) => item.nhom_danh_muc === original.nhom_danh_muc && item.ma === original.ma
    );

    if (index === -1) {
      return { success: false, message: 'Không tìm thấy danh mục cần cập nhật.' };
    }

    inMemoryDanhMuc[index] = updates;
    return { success: true, data: updates };
  }

  try {
    const sheets = getGoogleSheetsClient();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SYSTEM_ID,
      range: 'DANH_MUC!A2:D',
    });
    const rows = response.data.values || [];
    const rowIndex = rows.findIndex(
      (row) => String(row[0] || '') === original.nhom_danh_muc && String(row[1] || '') === original.ma
    );

    if (rowIndex === -1) {
      return { success: false, message: 'Không tìm thấy danh mục cần cập nhật trên Google Sheets.' };
    }

    const duplicate = rows.some(
      (row, index) =>
        index !== rowIndex &&
        String(row[0] || '') === updates.nhom_danh_muc &&
        String(row[1] || '') === updates.ma
    );
    if (duplicate) {
      return { success: false, message: 'Mã danh mục đã tồn tại trong nhóm này.' };
    }

    await sheets.spreadsheets.values.update({
      spreadsheetId: SYSTEM_ID,
      range: `DANH_MUC!A${rowIndex + 2}:D${rowIndex + 2}`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [[updates.nhom_danh_muc, updates.ma, updates.ten_gia_tri, updates.ghi_chu]],
      },
    });

    return { success: true, data: updates };
  } catch (error: any) {
    console.error('Google Sheets request failed');
    return {
      success: false,
      message: 'Không thể cập nhật danh mục trên Google Sheets.',
    };
  }
}

export async function getThongKeSystemList(): Promise<{ data: ThongKeItem[]; isDemo: boolean }> {
  if (!isGoogleCredentialsConfigured()) {
    return { data: inMemoryThongKe, isDemo: true };
  }

  try {
    const sheets = getGoogleSheetsClient();
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SYSTEM_ID,
      range: 'THONG_KE!A2:C',
    });

    const rows = res.data.values || [];
    const list: ThongKeItem[] = rows
      .filter((r) => r && r[0])
      .map((r) => ({
        chi_so: String(r[0] || ''),
        gia_tri: String(r[1] || ''),
        ghi_chu: String(r[2] || ''),
      }));

    return { data: list, isDemo: false };
  } catch {
    throw new Error('Không thể đọc Google Sheets. Vui lòng thử lại; dữ liệu chưa được lưu vào chế độ demo.');
  }
}

export async function getCauHinhList(): Promise<{ data: CauHinhItem[]; isDemo: boolean }> {
  if (!isGoogleCredentialsConfigured()) {
    return { data: inMemoryCauHinh, isDemo: true };
  }

  try {
    const sheets = getGoogleSheetsClient();
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SYSTEM_ID,
      range: 'CAU_HINH!A2:C',
    });

    const rows = res.data.values || [];
    const list: CauHinhItem[] = rows
      .filter((r) => r && r[0])
      .map((r) => ({
        tham_so: String(r[0] || ''),
        gia_tri: String(r[1] || ''),
        ghi_chu: String(r[2] || ''),
      }));

    return { data: list, isDemo: false };
  } catch {
    throw new Error('Không thể đọc Google Sheets. Vui lòng thử lại; dữ liệu chưa được lưu vào chế độ demo.');
  }
}

// ==============================================================================
// 4. TÍNH TOÁN THỐNG KÊ DASHBOARD
// ==============================================================================

export async function getDashboardData(selectedYear?: number) {
  const [denRes, diRes] = await Promise.all([getVanBanDenList(), getVanBanDiList()]);
  return { ...calculateStatistics(denRes.data, diRes.data, selectedYear), isDemo: denRes.isDemo || diRes.isDemo };
}

// ==============================================================================
// 5. KIỂM TRA KẾT NỐI HỆ THỐNG
// ==============================================================================

export async function testGoogleConnection(): Promise<{
  databaseConnected: boolean;
  systemConnected: boolean;
  clientEmailConfigured: boolean;
  privateKeyConfigured: boolean;
  databaseId: string;
  systemId: string;
  error?: string;
}> {
  const clientEmailConfigured = !!process.env.GOOGLE_CLIENT_EMAIL;
  const privateKeyConfigured = !!process.env.GOOGLE_PRIVATE_KEY;

  if (!clientEmailConfigured || !privateKeyConfigured) {
    return {
      databaseConnected: false,
      systemConnected: false,
      clientEmailConfigured,
      privateKeyConfigured,
      databaseId: DATABASE_ID,
      systemId: SYSTEM_ID,
      error: 'Chưa cấu hình GOOGLE_CLIENT_EMAIL hoặc GOOGLE_PRIVATE_KEY trong biến môi trường.',
    };
  }

  let dbOk = false;
  let sysOk = false;
  let errMsg = '';

  try {
    const sheets = getGoogleSheetsClient();
    // Test database sheet
    await sheets.spreadsheets.get({
      spreadsheetId: DATABASE_ID,
      fields: 'sheets.properties.title',
    });
    dbOk = true;

    // Test system sheet
    await sheets.spreadsheets.get({
      spreadsheetId: SYSTEM_ID,
      fields: 'sheets.properties.title',
    });
    sysOk = true;
  } catch (err: any) {
    errMsg = 'Không thể kết nối Google Sheets. Kiểm tra API và quyền chia sẻ.';
  }

  return {
    databaseConnected: dbOk,
    systemConnected: sysOk,
    clientEmailConfigured,
    privateKeyConfigured,
    databaseId: DATABASE_ID,
    systemId: SYSTEM_ID,
    error: errMsg || undefined,
  };
}

export function addVanBanDen(...args: Parameters<typeof addVanBanDenUnlocked>) {
  return withNumberingLock(() => addVanBanDenUnlocked(...args));
}

export function addVanBanDi(...args: Parameters<typeof addVanBanDiUnlocked>) {
  return withNumberingLock(() => addVanBanDiUnlocked(...args));
}

export function updateVanBanDen(...args: Parameters<typeof updateVanBanDenUnlocked>) {
  return withNumberingLock(() => updateVanBanDenUnlocked(...args));
}

export function updateVanBanDi(...args: Parameters<typeof updateVanBanDiUnlocked>) {
  return withNumberingLock(() => updateVanBanDiUnlocked(...args));
}
