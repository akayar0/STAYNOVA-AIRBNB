// backend/layers/02-business-logic-services/01-userService.js — KATMAN 2: Kullanıcı & Auth İş Mantığı (1. Kişi - AA | AIR-42)
const { userRepository } = require('../01-data-access-repositories/01-userRepository');
const { hashPassword, verifyPassword, signJwt } = require('../../auth');

function formatUser(u) {
  if (!u) return null;
  let preferences = { currency: 'TRY', language: 'tr' };
  try {
    if (u.preferences_json) preferences = { ...preferences, ...JSON.parse(u.preferences_json) };
  } catch {
    // Varsayılan tercihler korunur
  }
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    phone: u.phone || '',
    avatar: u.avatar || '',
    bio: u.bio || '',
    city: u.city || 'İstanbul',
    preferences,
    status: u.status,
    statusReason: u.status_reason || '',
    createdAt: u.created_at
  };
}

const userService = {
  registerUser(body) {
    const { name, email, password, role, phone, city } = body || {};
    if (!name || !email || !password) {
      return { status: 400, data: { error: 'Ad Soyad, E-posta ve Şifre alanları zorunludur.' } };
    }
    if (String(password).length < 6) {
      return { status: 400, data: { error: 'Şifreniz en az 6 karakter uzunluğunda olmalıdır.' } };
    }

    const existing = userRepository.findByEmail(email);
    if (existing) {
      if (existing.status === 'banned') {
        userRepository.deleteUserById(existing.id);
      } else {
        return { status: 409, data: { error: 'Bu e-posta adresi ile kayıtlı bir hesap zaten mevcut.' } };
      }
    }

    const targetRole = role === 'host' ? 'host' : 'guest';
    const defaultAvatar =
      targetRole === 'host'
        ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80';

    const created = userRepository.createUser({
      name: String(name).trim(),
      email: String(email).trim().toLowerCase(),
      passwordHash: hashPassword(password),
      role: targetRole,
      phone: phone ? String(phone).trim() : '',
      avatar: defaultAvatar,
      bio: targetRole === 'host' ? 'StayNova Ev Sahibi' : 'StayNova Misafir Üyesi',
      city: city ? String(city).trim() : 'İstanbul',
      preferencesJson: JSON.stringify({ currency: 'TRY', language: 'tr' }),
      createdAt: new Date().toISOString()
    });

    const token = signJwt({ sub: created.id, email: created.email, role: created.role, name: created.name });
    return {
      status: 201,
      data: {
        message: `Hoş geldiniz ${created.name}! ${targetRole === 'host' ? 'Ev Sahibi' : 'Misafir'} hesabınız oluşturuldu.`,
        token,
        user: formatUser(created)
      }
    };
  },

  loginUser(body) {
    const { email, password, reactivate, expectedRole } = body || {};
    if (!email || !password) {
      return { status: 400, data: { error: 'E-posta adresi ve şifre giriniz.' } };
    }
    const user = userRepository.findByEmail(email);
    if (!user || !verifyPassword(password, user.password_hash)) {
      return { status: 401, data: { error: 'E-posta adresi veya şifre hatalı.' } };
    }
    // e-Okul Tarzı Rol İzolasyonu (Misafir kapısından Ev Sahibi giremez, Admin ana siteden giremez)
    if (expectedRole && user.role !== expectedRole) {
      const roleLabels = { guest: 'MİSAFİR', host: 'EV SAHİBİ', admin: 'YÖNETİCİ' };
      return {
        status: 403,
        data: { error: `Bu giriş bölümü yalnızca ${roleLabels[expectedRole] || expectedRole.toUpperCase()} hesapları içindir.` }
      };
    }
    if (user.status === 'suspended') {
      const reasonText = user.status_reason || 'Platform kuralları ve güvenlik politikaları gereği hesabınız incelemeye alınmıştır.';
      return { status: 403, data: { error: `Hesabınız askıya alınmıştır. Gerekçe: ${reasonText}` } };
    }
    if (user.status === 'banned') {
      return {
        status: 403,
        data: { error: 'Hesabınız sistem yöneticisi tarafından kalıcı olarak engellenmiştir. Sisteme erişebilmek için lütfen yeniden kayıt olunuz.' }
      };
    }
    if (user.status === 'frozen' && !reactivate) {
      return {
        status: 403,
        data: { error: 'Hesabınız dondurulmuş durumdadır. Yeniden aktifleştirerek giriş yapabilirsiniz.', frozen: true }
      };
    }
    if (user.status === 'frozen' && reactivate) {
      userRepository.updateStatus(user.id, 'active', '');
      user.status = 'active';
    }

    const token = signJwt({ sub: user.id, email: user.email, role: user.role, name: user.name });
    return { status: 200, data: { message: 'Giriş başarılı.', token, user: formatUser(user) } };
  },

  getProfile(authUser) {
    if (!authUser) return { status: 401, data: { error: 'Oturum bulunamadı.' } };
    const user = userRepository.findById(authUser.id);
    if (!user) return { status: 404, data: { error: 'Kullanıcı bulunamadı.' } };
    return { status: 200, data: { user: formatUser(user) } };
  },

  updateProfile(authUser, body) {
    if (!authUser) return { status: 401, data: { error: 'Profil güncellemek için giriş yapmalısınız.' } };
    const existing = userRepository.findById(authUser.id);
    if (!existing) return { status: 404, data: { error: 'Kullanıcı bulunamadı.' } };

    let currentPrefs = { currency: 'TRY', language: 'tr' };
    try {
      if (existing.preferences_json) currentPrefs = JSON.parse(existing.preferences_json);
    } catch {
      // varsayılan
    }

    const updatedPrefs = {
      ...currentPrefs,
      ...(body.preferences || {})
    };

    const updated = userRepository.updateProfile(existing.id, {
      name: body.name !== undefined ? String(body.name).trim() : existing.name,
      phone: body.phone !== undefined ? String(body.phone).trim() : existing.phone,
      city: body.city !== undefined ? String(body.city).trim() : existing.city,
      avatar: body.avatar !== undefined ? String(body.avatar).trim() : existing.avatar,
      bio: body.bio !== undefined ? String(body.bio).trim() : existing.bio,
      preferencesJson: JSON.stringify(updatedPrefs)
    });

    return {
      status: 200,
      data: {
        message: 'Profil bilgileriniz başarıyla güncellendi.',
        user: formatUser(updated)
      }
    };
  }
};

module.exports = { userService, formatUser };

