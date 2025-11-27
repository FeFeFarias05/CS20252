const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface Pet {
  petId: string;
  nome: string;
  foto?: string;
  idade: number;
  raca: string;
  peso: number;
  medicacoes?: string;
  informacoes?: string;
  ownerId?: string | null;
}

export interface Owner {
  ownerId: string;
  nome: string;
  email: string;
  telefone?: string;
  endereco?: string;
}

export interface Appointment {
  appointmentId: string;
  petId: string;
  ownerId: string;
  data: string;
  hora: string;
  tipo: string;
  status: 'pendente' | 'confirmado' | 'cancelado';
  observacoes?: string;
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Users
  async getUsers(): Promise<User[]> {
    return this.request<User[]>('/api/users');
  }

  async getUser(id: string): Promise<User> {
    return this.request<User>(`/api/users/${id}`);
  }

  async createUser(user: Omit<User, 'id'>): Promise<User> {
    return this.request<User>('/api/users', {
      method: 'POST',
      body: JSON.stringify(user),
    });
  }

  async updateUser(id: string, user: Partial<User>): Promise<User> {
    return this.request<User>(`/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(user),
    });
  }

  async deleteUser(id: string): Promise<void> {
    return this.request<void>(`/api/users/${id}`, {
      method: 'DELETE',
    });
  }

  // Pets
  async getPets(): Promise<Pet[]> {
    return this.request<Pet[]>('/api/v1/pets');
  }

  async getPet(id: string): Promise<Pet> {
    return this.request<Pet>(`/api/v1/pets/${id}`);
  }

  async createPet(pet: Omit<Pet, 'petId'>): Promise<Pet> {
    return this.request<Pet>('/api/v1/pets', {
      method: 'POST',
      body: JSON.stringify(pet),
    });
  }

  async updatePet(id: string, pet: Partial<Pet>): Promise<Pet> {
    return this.request<Pet>(`/api/v1/pets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(pet),
    });
  }

  async deletePet(id: string): Promise<void> {
    return this.request<void>(`/api/v1/pets/${id}`, {
      method: 'DELETE',
    });
  }

  // Owners
  async getOwners(): Promise<Owner[]> {
    return this.request<Owner[]>('/api/v1/owners');
  }

  async getOwner(id: string): Promise<Owner> {
    return this.request<Owner>(`/api/v1/owners/${id}`);
  }

  async createOwner(owner: Omit<Owner, 'ownerId'>): Promise<Owner> {
    return this.request<Owner>('/api/v1/owners', {
      method: 'POST',
      body: JSON.stringify(owner),
    });
  }

  async updateOwner(id: string, owner: Partial<Owner>): Promise<Owner> {
    return this.request<Owner>(`/api/v1/owners/${id}`, {
      method: 'PUT',
      body: JSON.stringify(owner),
    });
  }

  async deleteOwner(id: string): Promise<void> {
    return this.request<void>(`/api/v1/owners/${id}`, {
      method: 'DELETE',
    });
  }

  // Appointments
  async getAppointments(): Promise<Appointment[]> {
    return this.request<Appointment[]>('/api/v1/appointments');
  }

  async getAppointment(id: string): Promise<Appointment> {
    return this.request<Appointment>(`/api/v1/appointments/${id}`);
  }

  async createAppointment(appointment: Omit<Appointment, 'appointmentId'>): Promise<Appointment> {
    return this.request<Appointment>('/api/v1/appointments', {
      method: 'POST',
      body: JSON.stringify(appointment),
    });
  }

  async updateAppointment(id: string, appointment: Partial<Appointment>): Promise<Appointment> {
    return this.request<Appointment>(`/api/v1/appointments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(appointment),
    });
  }

  async deleteAppointment(id: string): Promise<void> {
    return this.request<void>(`/api/v1/appointments/${id}`, {
      method: 'DELETE',
    });
  }
}

export const api = new ApiClient(API_URL);
