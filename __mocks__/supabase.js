/**
 * Manual mock for src/api/supabase.ts
 * All supabase calls return jest mock functions so individual tests can
 * override them with mockResolvedValueOnce / mockRejectedValueOnce.
 */

const mockSelect   = jest.fn();
const mockInsert   = jest.fn();
const mockUpdate   = jest.fn();
const mockDelete   = jest.fn();
const mockEq       = jest.fn();
const mockSingle   = jest.fn();
const mockOrder    = jest.fn();

// Default happy-path return so tests that don't care don't need to set up mocks
const defaultData = { data: [], error: null };

mockSelect.mockReturnValue({ eq: mockEq, order: mockOrder, single: mockSingle, data: [], error: null });
mockInsert.mockResolvedValue(defaultData);
mockUpdate.mockReturnValue({ eq: mockEq, select: jest.fn().mockReturnValue({ single: mockSingle }) });
mockDelete.mockReturnValue({ eq: mockEq });
mockEq.mockReturnValue({ eq: mockEq, order: mockOrder, single: mockSingle, data: [], error: null });
mockOrder.mockResolvedValue(defaultData);
mockSingle.mockResolvedValue(defaultData);

const mockFrom = jest.fn().mockReturnValue({
  select: mockSelect,
  insert: mockInsert,
  update: mockUpdate,
  delete: mockDelete,
  eq:     mockEq,
});

const mockSignInWithPassword = jest.fn().mockResolvedValue({ data: {}, error: null });
const mockSignUp             = jest.fn().mockResolvedValue({ data: { user: { id: "test-uid" }, session: null }, error: null });
const mockResetPasswordForEmail = jest.fn().mockResolvedValue({ data: {}, error: null });
const mockGetSession         = jest.fn().mockResolvedValue({ data: { session: null } });
const mockOnAuthStateChange  = jest.fn().mockReturnValue({ data: { subscription: { unsubscribe: jest.fn() } } });

export const supabase = {
  from: mockFrom,
  auth: {
    signInWithPassword:     mockSignInWithPassword,
    signUp:                 mockSignUp,
    resetPasswordForEmail:  mockResetPasswordForEmail,
    getSession:             mockGetSession,
    onAuthStateChange:      mockOnAuthStateChange,
  },
};

// Expose individual mocks so tests can reconfigure them
export const _mocks = {
  from:     mockFrom,
  select:   mockSelect,
  insert:   mockInsert,
  update:   mockUpdate,
  delete:   mockDelete,
  eq:       mockEq,
  order:    mockOrder,
  single:   mockSingle,
  signInWithPassword:    mockSignInWithPassword,
  signUp:                mockSignUp,
  resetPasswordForEmail: mockResetPasswordForEmail,
  getSession:            mockGetSession,
  onAuthStateChange:     mockOnAuthStateChange,
};
