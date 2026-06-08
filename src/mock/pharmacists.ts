import type { PharmacistInfo } from '../types';

const avatarGradient1 = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96"><defs><linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:%23667eea"/><stop offset="100%" style="stop-color:%23764ba2"/></linearGradient></defs><circle cx="48" cy="48" r="48" fill="url(%23g1)"/><circle cx="48" cy="38" r="16" fill="white" opacity="0.9"/><path d="M16 88c0-17.67 14.33-32 32-32s32 14.33 32 32" fill="white" opacity="0.9"/></svg>';

const avatarGradient2 = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96"><defs><linearGradient id="g2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:%23f093fb"/><stop offset="100%" style="stop-color:%23f5576c"/></linearGradient></defs><circle cx="48" cy="48" r="48" fill="url(%23g2)"/><circle cx="48" cy="38" r="16" fill="white" opacity="0.9"/><path d="M16 88c0-17.67 14.33-32 32-32s32 14.33 32 32" fill="white" opacity="0.9"/></svg>';

const avatarGradient3 = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96"><defs><linearGradient id="g3" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:%234facfe"/><stop offset="100%" style="stop-color:%2300f2fe"/></linearGradient></defs><circle cx="48" cy="48" r="48" fill="url(%23g3)"/><circle cx="48" cy="38" r="16" fill="white" opacity="0.9"/><path d="M16 88c0-17.67 14.33-32 32-32s32 14.33 32 32" fill="white" opacity="0.9"/></svg>';

export const pharmacists: PharmacistInfo[] = [
  {
    id: 'PH001',
    name: '王秀兰',
    avatar: avatarGradient1,
    licenseNo: '110101012345',
    specialty: '心血管内科',
    rating: 4.9,
    experienceYears: 25,
    isOnline: true,
    serviceHours: '08:00 - 20:00',
  },
  {
    id: 'PH002',
    name: '李建国',
    avatar: avatarGradient2,
    licenseNo: '310101023456',
    specialty: '内分泌与代谢病',
    rating: 4.8,
    experienceYears: 18,
    isOnline: true,
    serviceHours: '09:00 - 21:00',
  },
  {
    id: 'PH003',
    name: '张慧敏',
    avatar: avatarGradient3,
    licenseNo: '440101034567',
    specialty: '呼吸系统疾病',
    rating: 4.9,
    experienceYears: 12,
    isOnline: false,
    serviceHours: '10:00 - 22:00',
  },
];

export function getAllPharmacists(): PharmacistInfo[] {
  return pharmacists;
}

export function getOnlinePharmacists(): PharmacistInfo[] {
  return pharmacists.filter(p => p.isOnline);
}

export function getPharmacistById(id: string): PharmacistInfo | undefined {
  return pharmacists.find(p => p.id === id);
}
