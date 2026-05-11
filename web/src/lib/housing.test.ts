import { describe, it, expect, beforeEach, vi } from 'vitest';

interface QueryResult<T> {
  data: T;
  error: unknown;
}

const mocks = vi.hoisted(() => {
  const selectChain = {
    select: vi.fn(),
    eq: vi.fn(),
    or: vi.fn(),
    ilike: vi.fn(),
    gte: vi.fn(),
    lte: vi.fn(),
    order: vi.fn(),
    limit: vi.fn(),
    maybeSingle: vi.fn(),
    then: vi.fn(),
  };
  const insertChain = {
    insert: vi.fn(),
    select: vi.fn(),
    maybeSingle: vi.fn(),
  };
  const updateChain = {
    update: vi.fn(),
    eq: vi.fn(),
    select: vi.fn(),
    maybeSingle: vi.fn(),
  };
  return { selectChain, insertChain, updateChain };
});

function resolveChain<T>(chain: { then: ReturnType<typeof vi.fn> }, result: QueryResult<T>): void {
  chain.then.mockImplementationOnce(
    (
      onFulfilled: (value: QueryResult<T>) => unknown,
      onRejected?: (reason: unknown) => unknown,
    ) => {
      try {
        return Promise.resolve(onFulfilled(result));
      } catch (err) {
        if (onRejected) return Promise.resolve(onRejected(err));
        return Promise.reject(err);
      }
    },
  );
}

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn((_table: string) => ({
      select: (...args: unknown[]) => {
        mocks.selectChain.select(...args);
        return mocks.selectChain;
      },
      insert: (...args: unknown[]) => {
        mocks.insertChain.insert(...args);
        return mocks.insertChain;
      },
      update: (...args: unknown[]) => {
        mocks.updateChain.update(...args);
        return mocks.updateChain;
      },
    })),
  },
}));

import {
  acceptRequest,
  cancelRequest,
  createHousing,
  getHousing,
  HOUSING_CAPACITY_MAX,
  HOUSING_DESCRIPTION_MIN,
  HOUSING_REQUEST_MESSAGE_MIN,
  HOUSING_TITLE_MIN,
  listHousing,
  refuseRequest,
  requestHousing,
  validateHousingInput,
  validateRequestInput,
  type CreateHousingInput,
  type HousingRequestRow,
  type HousingRow,
  type RequestHousingInput,
} from '@/lib/housing';
import { postgrestErrorMessage } from '@/lib/postgrestError';

const sampleHousing: HousingRow = {
  id: 'h1',
  host_id: 'u1',
  title: 'Chambre d’amis à Cherbourg',
  description: 'a'.repeat(HOUSING_DESCRIPTION_MIN),
  city: 'Cherbourg',
  capacity: 2,
  available_from: '2026-06-01',
  available_to: '2026-07-15',
  is_published: true,
  created_at: '2026-05-01T00:00:00Z',
  updated_at: '2026-05-01T00:00:00Z',
};

const sampleRequest: HousingRequestRow = {
  id: 'r1',
  housing_id: 'h1',
  requester_id: 'u2',
  message: 'm'.repeat(HOUSING_REQUEST_MESSAGE_MIN),
  starts_on: '2026-06-10',
  ends_on: '2026-06-15',
  status: 'pending',
  created_at: '2026-05-02T00:00:00Z',
  updated_at: '2026-05-02T00:00:00Z',
};

const validInput = (): CreateHousingInput => ({
  hostId: 'u1',
  title: 'Chambre d’amis à Cherbourg',
  description: 'd'.repeat(HOUSING_DESCRIPTION_MIN),
  city: 'Cherbourg',
  capacity: 2,
  availableFrom: '2026-06-01',
  availableTo: '2026-07-15',
});

const validRequest = (): RequestHousingInput => ({
  housingId: 'h1',
  requesterId: 'u2',
  message: 'x'.repeat(HOUSING_REQUEST_MESSAGE_MIN),
  startsOn: '2026-06-10',
  endsOn: '2026-06-15',
});

beforeEach(() => {
  vi.clearAllMocks();
  mocks.selectChain.select.mockReturnValue(mocks.selectChain);
  mocks.selectChain.eq.mockReturnValue(mocks.selectChain);
  mocks.selectChain.or.mockReturnValue(mocks.selectChain);
  mocks.selectChain.ilike.mockReturnValue(mocks.selectChain);
  mocks.selectChain.gte.mockReturnValue(mocks.selectChain);
  mocks.selectChain.lte.mockReturnValue(mocks.selectChain);
  mocks.selectChain.order.mockReturnValue(mocks.selectChain);
  mocks.selectChain.limit.mockReturnValue(mocks.selectChain);

  mocks.insertChain.insert.mockReturnValue(mocks.insertChain);
  mocks.insertChain.select.mockReturnValue(mocks.insertChain);

  mocks.updateChain.update.mockReturnValue(mocks.updateChain);
  mocks.updateChain.eq.mockReturnValue(mocks.updateChain);
  mocks.updateChain.select.mockReturnValue(mocks.updateChain);
});

describe('validateHousingInput', () => {
  it('valide un input correct', () => {
    expect(validateHousingInput(validInput())).toEqual([]);
  });

  it('refuse un titre trop court', () => {
    const issues = validateHousingInput({ ...validInput(), title: 'a' });
    expect(issues.some((i) => i.field === 'title')).toBe(true);
  });

  it('refuse une description sous le seuil', () => {
    const issues = validateHousingInput({ ...validInput(), description: 'court' });
    expect(issues.some((i) => i.field === 'description')).toBe(true);
  });

  it('refuse une ville trop courte', () => {
    const issues = validateHousingInput({ ...validInput(), city: 'a' });
    expect(issues.some((i) => i.field === 'city')).toBe(true);
  });

  it('refuse une capacité hors bornes', () => {
    const tooLow = validateHousingInput({ ...validInput(), capacity: 0 });
    expect(tooLow.some((i) => i.field === 'capacity')).toBe(true);
    const tooHigh = validateHousingInput({ ...validInput(), capacity: HOUSING_CAPACITY_MAX + 1 });
    expect(tooHigh.some((i) => i.field === 'capacity')).toBe(true);
  });

  it('refuse une plage de dates inversée', () => {
    const issues = validateHousingInput({
      ...validInput(),
      availableFrom: '2026-08-01',
      availableTo: '2026-06-01',
    });
    expect(issues.some((i) => i.field === 'availableTo')).toBe(true);
  });
});

describe('validateRequestInput', () => {
  it('valide un input correct', () => {
    expect(validateRequestInput(validRequest())).toEqual([]);
  });

  it('refuse un message sous le seuil', () => {
    const issues = validateRequestInput({ ...validRequest(), message: 'court' });
    expect(issues.some((i) => i.field === 'message')).toBe(true);
  });

  it('refuse une date de départ antérieure à l’arrivée', () => {
    const issues = validateRequestInput({
      ...validRequest(),
      startsOn: '2026-06-15',
      endsOn: '2026-06-10',
    });
    expect(issues.some((i) => i.field === 'endsOn')).toBe(true);
  });

  it('refuse des dates invalides', () => {
    const issues = validateRequestInput({
      ...validRequest(),
      startsOn: 'pas une date',
      endsOn: 'autre chose',
    });
    expect(issues.some((i) => i.field === 'startsOn')).toBe(true);
    expect(issues.some((i) => i.field === 'endsOn')).toBe(true);
  });
});

describe('listHousing', () => {
  it('renvoie la liste publique triée par created_at DESC', async () => {
    const rows = [sampleHousing, { ...sampleHousing, id: 'h2' }];
    resolveChain(mocks.selectChain, { data: rows, error: null });
    const { data, error } = await listHousing();
    expect(error).toBeNull();
    expect(data).toHaveLength(2);
    expect(mocks.selectChain.eq).toHaveBeenCalledWith('is_published', true);
    expect(mocks.selectChain.order).toHaveBeenCalledWith('created_at', { ascending: false });
    expect(mocks.selectChain.limit).toHaveBeenCalledWith(50);
  });

  it('applique les filtres city/capacityMin', async () => {
    resolveChain(mocks.selectChain, { data: [], error: null });
    await listHousing({ city: 'Cherbourg', capacityMin: 3 });
    expect(mocks.selectChain.ilike).toHaveBeenCalledWith('city', 'Cherbourg');
    expect(mocks.selectChain.gte).toHaveBeenCalledWith('capacity', 3);
  });

  it('applique le filtre search avec or() sur title/city/description', async () => {
    resolveChain(mocks.selectChain, { data: [], error: null });
    await listHousing({ search: 'chambre' });
    expect(mocks.selectChain.or).toHaveBeenCalledWith(
      'title.ilike.%chambre%,city.ilike.%chambre%,description.ilike.%chambre%',
    );
  });

  it('échappe les méta-caractères ilike dans search', async () => {
    resolveChain(mocks.selectChain, { data: [], error: null });
    await listHousing({ search: '50%_,' });
    expect(mocks.selectChain.or).toHaveBeenCalledWith(
      'title.ilike.%50\\%\\_\\,%,city.ilike.%50\\%\\_\\,%,description.ilike.%50\\%\\_\\,%',
    );
  });

  it('mappe une erreur Postgrest 42501 en FR', async () => {
    resolveChain(mocks.selectChain, {
      data: null,
      error: {
        message: 'denied',
        details: '',
        hint: '',
        code: '42501',
        name: 'PostgrestError',
      },
    });
    const { error } = await listHousing();
    expect(error).toMatchObject({ code: '42501' });
    expect(postgrestErrorMessage(error)).toBe(
      'Vous n’avez pas les droits pour effectuer cette action.',
    );
  });
});

describe('getHousing', () => {
  it('renvoie l’hébergement par ID', async () => {
    mocks.selectChain.maybeSingle.mockResolvedValueOnce({ data: sampleHousing, error: null });
    const { data, error } = await getHousing('h1');
    expect(error).toBeNull();
    expect(data?.id).toBe('h1');
    expect(mocks.selectChain.eq).toHaveBeenCalledWith('id', 'h1');
  });

  it('renvoie data: null si l’ID est introuvable', async () => {
    mocks.selectChain.maybeSingle.mockResolvedValueOnce({ data: null, error: null });
    const { data, error } = await getHousing('inconnu');
    expect(error).toBeNull();
    expect(data).toBeNull();
  });
});

describe('createHousing', () => {
  it('refuse un input invalide sans appeler Supabase', async () => {
    const { data, error } = await createHousing({
      ...validInput(),
      title: 'a',
    });
    expect(data).toBeNull();
    expect(error?.code).toBe('HOUSING_VALIDATION');
    expect(mocks.insertChain.insert).not.toHaveBeenCalled();
  });

  it('insère une annonce valide', async () => {
    mocks.insertChain.maybeSingle.mockResolvedValueOnce({ data: sampleHousing, error: null });
    const { data, error } = await createHousing(validInput());
    expect(error).toBeNull();
    expect(data?.id).toBe('h1');
    expect(mocks.insertChain.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        host_id: 'u1',
        title: validInput().title,
        capacity: 2,
        is_published: true,
      }),
    );
  });

  it('remonte l’erreur Postgrest sans rejouer', async () => {
    mocks.insertChain.maybeSingle.mockResolvedValueOnce({
      data: null,
      error: {
        message: 'denied',
        details: '',
        hint: '',
        code: '42501',
        name: 'PostgrestError',
      },
    });
    const { data, error } = await createHousing(validInput());
    expect(data).toBeNull();
    expect(error?.code).toBe('42501');
    expect(mocks.insertChain.insert).toHaveBeenCalledTimes(1);
  });
});

describe('requestHousing', () => {
  it('refuse un input invalide', async () => {
    const { data, error } = await requestHousing({ ...validRequest(), message: 'court' });
    expect(data).toBeNull();
    expect(error?.code).toBe('HOUSING_REQUEST_VALIDATION');
    expect(mocks.insertChain.insert).not.toHaveBeenCalled();
  });

  it('insère une demande pending', async () => {
    mocks.insertChain.maybeSingle.mockResolvedValueOnce({ data: sampleRequest, error: null });
    const { data, error } = await requestHousing(validRequest());
    expect(error).toBeNull();
    expect(data?.id).toBe('r1');
    expect(mocks.insertChain.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        housing_id: 'h1',
        requester_id: 'u2',
        status: 'pending',
      }),
    );
  });
});

describe('cancelRequest / acceptRequest / refuseRequest', () => {
  it('cancelRequest met à jour le statut à cancelled', async () => {
    mocks.updateChain.maybeSingle.mockResolvedValueOnce({
      data: { ...sampleRequest, status: 'cancelled' },
      error: null,
    });
    const { data, error } = await cancelRequest('r1');
    expect(error).toBeNull();
    expect(data?.status).toBe('cancelled');
    expect(mocks.updateChain.update).toHaveBeenCalledWith({ status: 'cancelled' });
    expect(mocks.updateChain.eq).toHaveBeenCalledWith('id', 'r1');
  });

  it('acceptRequest met à jour le statut à accepted', async () => {
    mocks.updateChain.maybeSingle.mockResolvedValueOnce({
      data: { ...sampleRequest, status: 'accepted' },
      error: null,
    });
    const { data, error } = await acceptRequest('r1');
    expect(error).toBeNull();
    expect(data?.status).toBe('accepted');
    expect(mocks.updateChain.update).toHaveBeenCalledWith({ status: 'accepted' });
  });

  it('refuseRequest met à jour le statut à declined', async () => {
    mocks.updateChain.maybeSingle.mockResolvedValueOnce({
      data: { ...sampleRequest, status: 'declined' },
      error: null,
    });
    const { data, error } = await refuseRequest('r1');
    expect(error).toBeNull();
    expect(data?.status).toBe('declined');
    expect(mocks.updateChain.update).toHaveBeenCalledWith({ status: 'declined' });
  });
});

describe('constantes exportées', () => {
  it('HOUSING_TITLE_MIN > 0', () => {
    expect(HOUSING_TITLE_MIN).toBeGreaterThan(0);
  });
});
