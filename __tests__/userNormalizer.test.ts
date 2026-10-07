import { normalizeUser } from '../src/utils/userNormalizer';

// Exact shape returned by GET user/get-profile (verified live) - note it has
// NO partner_name and NO area.
const GET_PROFILE_USER = {
  id: 7,
  uid: 'GST-7',
  name: 'Aman',
  email: 'amanbiban9@gmail.com',
  phone: '8619115648',
  status: 'inactive',
  membership: null,
  no_of_refer: 0,
  fcm_token: 'abc',
};

const GET_PROFILE = {
  user: GET_PROFILE_USER,
  profile: {
    id: 54,
    join_date: '2026-10-01',
    membership: 'User',
    dob: '2026-10-01',
    dom: '2026-10-01',
    profession: 'Student',
    profile_pic: 'https://gst.tambimotors.com/uploads/profiles/a.png',
    certificate: '',
    bio: 'Test',
    referral_code: 'AMAN194',
    country: 'India',
    city: 'Hanumangarh',
    pincode: '335512',
    state: 'Rajasthan',
    address: 'Jaipur',
  },
  statistics: { posts_count: 0, likes_count: 0, referrals_count: 0, total_donation: 0 },
};

// Exact "raw" shape returned by user/verify-otp + user/members:
// partner_name is a column on `users`, area is a column on `profiles`.
const RAW_AUTH_USER = {
  id: 7,
  uid: 'GST-7',
  name: 'Aman',
  partner_name: 'Test',
  email: 'amanbiban9@gmail.com',
  phone: '8619115648',
  phone_verified_at: null,
  user_profile: {
    id: 54,
    user_id: 7,
    membership: 'User',
    area: 'Test',
    profile_pic: 'uploads/profiles/rel.png',
  },
};

describe('normalizeUser', () => {
  it('exposes rich get-profile fields on user.profile', () => {
    const u = normalizeUser(GET_PROFILE);
    expect(u.profile.bio).toBe('Test');
    expect(u.profile.city).toBe('Hanumangarh');
    expect(u.profile.pincode).toBe('335512');
    expect(u.profile.address).toBe('Jaipur');
    expect(u.profile.membership).toBe('User');
  });

  it('REGRESSION: lifts partner_name from the users table when profile omits it', () => {
    const u = normalizeUser(GET_PROFILE);
    // get-profile never returns partner_name -> must be null, not undefined
    expect(GET_PROFILE.profile).not.toHaveProperty('partner_name');
    expect(u.profile.partner_name).toBeNull();
  });

  it('REGRESSION: lifts partner_name from the raw auth/members shape', () => {
    const u = normalizeUser(RAW_AUTH_USER);
    expect(u.profile.partner_name).toBe('Test');
  });

  it('REGRESSION: lifts area from user_profile when profile omits it', () => {
    const u = normalizeUser(RAW_AUTH_USER);
    expect(GET_PROFILE.profile).not.toHaveProperty('area');
    expect(u.profile.area).toBe('Test');
  });

  it('prefers the fresh get-profile value over the stale raw one', () => {
    // store shape after getProfile() merges over the auth response
    const merged = {
      ...RAW_AUTH_USER,
      ...GET_PROFILE.user,
      profile: GET_PROFILE.profile,
    };
    const u = normalizeUser(merged);

    expect(u.profile.bio).toBe('Test');
    expect(u.profile.city).toBe('Hanumangarh');
    // partner_name survives the merge because get-profile does not overwrite it
    expect(u.profile.partner_name).toBe('Test');
    // area comes from user_profile since get-profile has no area column
    expect(u.profile.area).toBe('Test');
  });

  it('lets a freshly cleared (null) value from user_profile win over top-level', () => {
    const u = normalizeUser({
      ...RAW_AUTH_USER,
      user_profile: { ...RAW_AUTH_USER.user_profile, area: null },
    });
    expect(u.profile.area).toBeNull();
  });

  it('always defines every canonical field so forms never see undefined', () => {
    const u = normalizeUser({ id: 1, name: 'x' });
    [
      'dob', 'dom', 'partner_name', 'profession', 'bio', 'country',
      'city', 'state', 'pincode', 'address', 'area',
    ].forEach(f => {
      expect(u.profile[f]).toBeNull();
    });
  });

  it('makes profile_pic absolute for both absolute and relative server paths', () => {
    expect(normalizeUser(GET_PROFILE).profile.profile_pic).toBe(
      'https://gst.tambimotors.com/uploads/profiles/a.png',
    );
    expect(normalizeUser(RAW_AUTH_USER).profile.profile_pic).toBe(
      'https://gst.tambimotors.com/uploads/profiles/rel.png',
    );
  });

  it('keeps the raw user fields and statistics intact', () => {
    const u = normalizeUser(GET_PROFILE);
    expect(u.id).toBe(7);
    expect(u.name).toBe('Aman');
    expect(u.phone).toBe('8619115648');
    expect(u.statistics).toEqual(GET_PROFILE.statistics);
  });

  it('keeps user_profile alias in sync with profile', () => {
    const u = normalizeUser(RAW_AUTH_USER);
    expect(u.user_profile.area).toBe('Test');
    expect(u.user_profile.partner_name).toBe('Test');
  });

  it('tolerates null / undefined input', () => {
    expect(normalizeUser(null)).toBeNull();
    expect(normalizeUser(undefined)).toBeUndefined();
  });
});
