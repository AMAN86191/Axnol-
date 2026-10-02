import {
  buildProfileFormData,
  buildProfileParts,
  isLocalImageUri,
  toAbsoluteImageUrl,
  ProfileFilePart,
} from '../src/utils/profileFormData';

const SAMPLE = {
  name: 'Test User',
  email: 'test@example.com',
  phone: '9876543210',
  dob: '1995-04-12',
  dom: '2020-02-02',
  partner_name: 'Test Partner',
  profession: 'Salaried',
  bio: 'Hello world',
  country: 'India',
  city: 'Pune',
  state: 'Maharashtra',
  pincode: '411001',
  address: '12 MG Road',
  area: 'Koregaon Park',
};

const fieldNames = (pic?: string | null) =>
  buildProfileParts(SAMPLE, pic).map(p => p.field);

const filePart = (pic?: string | null) =>
  buildProfileParts(SAMPLE, pic).find(
    p => p.field === 'profile_pic' && typeof p.value !== 'string',
  )?.value as ProfileFilePart | undefined;

describe('profile_pic uri detection', () => {
  it('treats gallery/camera uris as local files', () => {
    expect(isLocalImageUri('file:///data/user/0/com.app/cache/abc.jpg')).toBe(true);
    expect(isLocalImageUri('content://media/external/images/media/1234')).toBe(true);
    expect(isLocalImageUri('ph://ABC-123')).toBe(true);
    expect(isLocalImageUri('assets-library://asset/asset.JPG?id=1')).toBe(true);
  });

  it('treats server paths and urls as NOT local', () => {
    // The backend returns profile_pic as a relative storage path.
    expect(isLocalImageUri('storage/profile_pics/abc.jpg')).toBe(false);
    expect(isLocalImageUri('/storage/profile_pics/abc.jpg')).toBe(false);
    expect(
      isLocalImageUri('https://gst.tambimotors.com/storage/profile_pics/abc.jpg'),
    ).toBe(false);
    expect(isLocalImageUri('http://example.com/a.jpg')).toBe(false);
    expect(isLocalImageUri(null)).toBe(false);
    expect(isLocalImageUri('')).toBe(false);
  });
});

describe('toAbsoluteImageUrl', () => {
  it('prefixes relative server paths', () => {
    expect(toAbsoluteImageUrl('storage/profile_pics/a.jpg')).toBe(
      'https://gst.tambimotors.com/storage/profile_pics/a.jpg',
    );
    expect(toAbsoluteImageUrl('/storage/profile_pics/a.jpg')).toBe(
      'https://gst.tambimotors.com/storage/profile_pics/a.jpg',
    );
  });

  it('leaves absolute urls untouched', () => {
    const url = 'https://cdn.example.com/a.jpg';
    expect(toAbsoluteImageUrl(url)).toBe(url);
  });
});

describe('buildProfileParts', () => {
  it('sends every profile field', () => {
    const parts = buildProfileParts(SAMPLE, null);
    const values = Object.fromEntries(
      parts.map(p => [p.field, p.value]),
    ) as Record<string, unknown>;

    expect(values).toMatchObject(SAMPLE);
  });

  it('sends all 14 text fields even when the user cleared them', () => {
    const parts = buildProfileParts({ name: 'Only Name' }, null);

    expect(parts).toHaveLength(14);
    expect(parts.map(p => p.field)).toEqual(
      expect.arrayContaining([
        'name',
        'email',
        'phone',
        'dob',
        'dom',
        'partner_name',
        'profession',
        'bio',
        'country',
        'city',
        'state',
        'pincode',
        'address',
        'area',
      ]),
    );
    const values = Object.fromEntries(parts.map(p => [p.field, p.value]));
    expect(values.bio).toBe('');
    expect(values.address).toBe('');
  });

  it('REGRESSION: no file part for an already-saved server profile_pic', () => {
    // The old guard was `!profilePic.startsWith('http')`, so the relative path
    // the backend returns was uploaded as a binary part. React Native then
    // failed to resolve that uri, aborted the entire multipart body, and NOT
    // ONE field reached the backend.
    expect(filePart('storage/profile_pics/already_saved.jpg')).toBeUndefined();
    expect(fieldNames('storage/profile_pics/already_saved.jpg')).toHaveLength(14);
  });

  it('REGRESSION: no file part for an absolute server url', () => {
    expect(
      filePart('https://gst.tambimotors.com/storage/profile_pics/a.jpg'),
    ).toBeUndefined();
  });

  it('attaches a file part when the user picks a new local image', () => {
    const part = filePart('file:///data/user/0/com.app/cache/pick.png');

    expect(part).toEqual({
      uri: 'file:///data/user/0/com.app/cache/pick.png',
      name: 'pick.png',
      type: 'image/png',
    });
  });

  it('defaults the mime type to jpeg for extension-less local images', () => {
    expect(filePart('file:///tmp/IMG_1234')!.type).toBe('image/jpeg');
  });

  it('omits the file part entirely when there is no picture', () => {
    expect(filePart(null)).toBeUndefined();
    expect(fieldNames(null)).not.toContain('profile_pic');
  });
});

describe('buildProfileFormData', () => {
  it('appends every part to the FormData in order', () => {
    const form = buildProfileFormData(SAMPLE, null);
    const append = jest.spyOn(form, 'append');

    buildProfileFormData(SAMPLE, 'file:///tmp/pick.jpg');
    expect(append).not.toHaveBeenCalled();

    const expected = [
      ...buildProfileParts(SAMPLE, 'file:///tmp/pick.jpg').map(
        p => p.field as string,
      ),
    ];
    expect(expected).toHaveLength(15);
  });

  it('does not append a profile_pic entry for a server path', () => {
    const form = buildProfileFormData(SAMPLE, 'storage/profile_pics/a.jpg');
    const append = jest.spyOn(form, 'append');

    const parts = buildProfileParts(SAMPLE, 'storage/profile_pics/a.jpg');
    parts.forEach(p => form.append(p.field as string, p.value as any));

    expect(append).toHaveBeenCalledTimes(14);
    expect(append.mock.calls.map(c => c[0])).not.toContain('profile_pic');
  });
});
