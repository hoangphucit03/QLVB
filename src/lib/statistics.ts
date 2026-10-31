import type { VanBanDen, VanBanDi } from './types';

export function calculateStatistics(incoming: VanBanDen[], outgoing: VanBanDi[], year?: number, now = new Date()) {
  const den = incoming.filter(d => year === undefined || Number(d.nam) === year);
  const di = outgoing.filter(d => year === undefined || Number(d.nam) === year);
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
  const overdue = (d: VanBanDen) => !['Không', 'Đã hoàn thành'].includes(d.trang_thai) && (d.trang_thai === 'Quá hạn' || Boolean(d.han_xu_ly && d.han_xu_ly.slice(0, 10) < today));
  const counts = (key: 'loai_van_ban' | 'co_quan_gui' | 'nguoi_xu_ly') => {
    const result: Record<string, number> = Object.create(null);
    for (const d of den) { const name = d[key]?.trim() || (key === 'nguoi_xu_ly' ? 'Chưa phân công' : 'Chưa phân loại'); result[name] = (result[name] || 0) + 1; }
    return result;
  };
  return {
    stats: {
      tong_den: den.length, tong_di: di.length,
      chua_xu_ly: den.filter(d => !overdue(d) && !['Không', 'Đã hoàn thành', 'Đang xử lý'].includes(d.trang_thai)).length,
      khong_xu_ly: den.filter(d => d.trang_thai === 'Không').length,
      dang_xu_ly: den.filter(d => !overdue(d) && d.trang_thai === 'Đang xử lý').length,
      da_hoan_thanh: den.filter(d => d.trang_thai === 'Đã hoàn thành').length,
      qua_han: den.filter(overdue).length,
      can_xu_ly_gap: den.filter(d => !['Không', 'Đã hoàn thành'].includes(d.trang_thai) && ['Khẩn', 'Thượng khẩn', 'Hỏa tốc'].includes(d.muc_do_uu_tien)).length,
      thong_ke_thang: Array.from({ length: 12 }, (_, i) => ({ thang: i + 1, ten_thang: `T${i + 1}`, van_ban_den: den.filter(d => Number(d.ngay_den?.slice(5, 7)) === i + 1).length, van_ban_di: di.filter(d => Number(d.ngay_phat_hanh?.slice(5, 7)) === i + 1).length })),
      van_ban_den_moi_nhat: [...den].sort((a,b) => b.ngay_tao.localeCompare(a.ngay_tao)).slice(0,5),
      van_ban_di_moi_nhat: [...di].sort((a,b) => b.ngay_tao.localeCompare(a.ngay_tao)).slice(0,5),
    },
    breakdown: { types: counts('loai_van_ban'), agencies: counts('co_quan_gui'), assignees: counts('nguoi_xu_ly') },
  };
}
