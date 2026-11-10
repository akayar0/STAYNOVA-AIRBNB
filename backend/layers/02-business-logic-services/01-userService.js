const { userRepository } = require('../01-data-access-repositories/01-userRepository');
const { hashPassword, verifyPassword, signJwt } = require('../../auth');

function formatUser(u) {
  if (!u) return null;
  let preferences = {};
  try { preferences = JSON.parse(u.preferences_json || '{}'); } catch {}
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    phone: u.phone || '',
    city: u.city || 'İstanbul',
    avatar: u.avatar || '',
    bio: u.bio || '',
    status: u.status,
    preferences,
    createdAt: u.created_at
  };
}

const userService = {
  registerUser(body) {
    const { name, email, password, role, phone, city } = body;
    if (!name || !email || !password) {
      return { status: 400, data: { error: 'Ad Soyad, E-posta ve Şifre alanları zorunludur.' } };
    }
    const existing = userRepository.findByEmail(email);
    if (existing) {
      return { status: 409, data: { error: 'Bu e-posta adresi zaten kayıtlıdır.' } };
    }
    const assignedRole = ['guest', 'host'].includes(role) ? role : 'guest';
    const newUser = userRepository.createUser({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      passwordHash: hashPassword(password),
      role: assignedRole,
      phone: phone || '',
      city: city || 'İstanbul',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=240&q=80',
      createdAt: new Date().toISOString()
    });
    const token = signJwt({ sub: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name });
    return { status: 201, data: { message: 'Kayıt başarılı! Hoş geldiniz.', token, user: formatUser(newUser) } };
  },

  loginUser(body) {
    const { email, password, expectedRole } = body;
    const user = userRepository.findByEmail(email);
    if (!user || !verifyPassword(password, user.password_hash)) {
      return { status: 401, data: { error: 'E-posta adresi veya şifre hatalı.' } };
    }
    if (expectedRole && user.role !== expectedRole) {
      return { status: 403, data: { error: `Bu giriş bölümü yalnızca ${expectedRole.toUpperCase()} hesapları içindir.` } };
    }
    if (user.status === 'suspended') {
      return { status: 403, data: { error: `Hesabınız askıya alınmıştır. Gerekçe: ${user.status_reason || 'Güvenlik incelemesi'}` } };
    }
    if (user.status === 'banned') {
      return { status: 403, data: { error: 'Hesabınız sistem yöneticisi tarafından engellenmiştir.' } };
    }
    const token = signJwt({ sub: user.id, email: user.email, role: user.role, name: user.name });
    return { status: 200, data: { message: 'Giriş başarılı.', token, user: formatUser(user) } };
  },

  updateProfile(authUser, body) {
    if (!authUser) return { status: 401, data: { error: 'Yetkisiz erişim.' } };
    const updated = userRepository.updateProfile(authUser.id, {
      name: body.name,
      phone: body.phone,
      city: body.city,
      avatar: body.avatar,
      bio: body.bio,
      preferencesJson: body.preferences ? JSON.stringify(body.preferences) : undefined
    });
    return { status: 200, data: { message: 'Profiliniz güncellendi.', user: formatUser(updated) } };
  }
};

module.exports = { userService, formatUser };

