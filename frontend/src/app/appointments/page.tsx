'use client';

import { useState, useEffect } from 'react';
import { api, Appointment, Pet, Owner } from '@/lib/api';

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [owners, setOwners] = useState<Owner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [formData, setFormData] = useState({
    petId: '',
    ownerId: '',
    data: '',
    hora: '',
    tipo: '',
    status: 'pendente' as 'pendente' | 'confirmado' | 'cancelado',
    observacoes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [appointmentsRes, petsRes, ownersRes] = await Promise.all([
        api.getAppointments(),
        api.getPets(),
        api.getOwners()
      ]);
      const appointmentsData = Array.isArray(appointmentsRes) ? appointmentsRes : (appointmentsRes as any).items || [];
      const petsData = Array.isArray(petsRes) ? petsRes : (petsRes as any).items || [];
      const ownersData = Array.isArray(ownersRes) ? ownersRes : (ownersRes as any).items || [];
      setAppointments(appointmentsData);
      setPets(petsData);
      setOwners(ownersData);
    } catch (err) {
      setError('Erro ao carregar dados. Verifique se o backend está rodando.');
      console.error('Erro ao carregar dados:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAppointment) {
        const updated = await api.updateAppointment(editingAppointment.appointmentId, formData);
        setAppointments(appointments.map(a => a.appointmentId === updated.appointmentId ? updated : a));
      } else {
        const created = await api.createAppointment(formData);
        setAppointments([...appointments, created]);
      }
      resetForm();
    } catch (err) {
      alert('Erro ao salvar: ' + (err as Error).message);
    }
  };

  const handleEdit = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setFormData({
      petId: appointment.petId,
      ownerId: appointment.ownerId,
      data: appointment.data,
      hora: appointment.hora,
      tipo: appointment.tipo,
      status: appointment.status,
      observacoes: appointment.observacoes || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja remover este agendamento?')) {
      try {
        await api.deleteAppointment(id);
        setAppointments(appointments.filter(a => a.appointmentId !== id));
      } catch (err) {
        alert('Erro ao deletar: ' + (err as Error).message);
      }
    }
  };

  const resetForm = () => {
    setFormData({ petId: '', ownerId: '', data: '', hora: '', tipo: '', status: 'pendente', observacoes: '' });
    setEditingAppointment(null);
    setShowForm(false);
  };

  const getPetName = (petId: string) => pets.find(p => p.petId === petId)?.nome || petId;
  const getOwnerName = (ownerId: string) => owners.find(o => o.ownerId === ownerId)?.nome || ownerId;

  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <h1>Agendamentos</h1>
        <button onClick={() => setShowForm(true)} style={{ padding: '10px 20px', cursor: 'pointer' }}>
          + Novo Agendamento
        </button>
      </div>

      {error && (
        <div style={{ padding: 12, backgroundColor: '#fee', border: '1px solid #c00', borderRadius: 4, marginBottom: 12 }}>
          {error}
        </div>
      )}

      {loading && <p>Carregando...</p>}

      {!loading && appointments.length === 0 ? (
        <p>Nenhum agendamento cadastrado.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f0f0f0' }}>
              <th style={{ padding: 10, textAlign: 'left', border: '1px solid #ddd' }}>Pet</th>
              <th style={{ padding: 10, textAlign: 'left', border: '1px solid #ddd' }}>Dono</th>
              <th style={{ padding: 10, textAlign: 'left', border: '1px solid #ddd' }}>Data</th>
              <th style={{ padding: 10, textAlign: 'left', border: '1px solid #ddd' }}>Hora</th>
              <th style={{ padding: 10, textAlign: 'left', border: '1px solid #ddd' }}>Tipo</th>
              <th style={{ padding: 10, textAlign: 'left', border: '1px solid #ddd' }}>Status</th>
              <th style={{ padding: 10, textAlign: 'left', border: '1px solid #ddd' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map(appointment => (
              <tr key={appointment.appointmentId}>
                <td style={{ padding: 10, border: '1px solid #ddd' }}>{getPetName(appointment.petId)}</td>
                <td style={{ padding: 10, border: '1px solid #ddd' }}>{getOwnerName(appointment.ownerId)}</td>
                <td style={{ padding: 10, border: '1px solid #ddd' }}>{appointment.data}</td>
                <td style={{ padding: 10, border: '1px solid #ddd' }}>{appointment.hora}</td>
                <td style={{ padding: 10, border: '1px solid #ddd' }}>{appointment.tipo}</td>
                <td style={{ padding: 10, border: '1px solid #ddd' }}>{appointment.status}</td>
                <td style={{ padding: 10, border: '1px solid #ddd' }}>
                  <button onClick={() => handleEdit(appointment)} style={{ marginRight: 8, cursor: 'pointer' }}>Editar</button>
                  <button onClick={() => handleDelete(appointment.appointmentId)} style={{ cursor: 'pointer' }}>Deletar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showForm && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: 30, borderRadius: 8, width: 500, maxWidth: '90%', maxHeight: '90vh', overflow: 'auto' }}>
            <h2>{editingAppointment ? 'Editar Agendamento' : 'Novo Agendamento'}</h2>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 15 }}>
                <label style={{ display: 'block', marginBottom: 5 }}>Pet *</label>
                <select
                  value={formData.petId}
                  onChange={e => setFormData({ ...formData, petId: e.target.value })}
                  required
                  style={{ width: '100%', padding: 8, boxSizing: 'border-box' }}
                >
                  <option value="">Selecione um pet</option>
                  {pets.map(pet => (
                    <option key={pet.petId} value={pet.petId}>{pet.nome}</option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: 15 }}>
                <label style={{ display: 'block', marginBottom: 5 }}>Dono *</label>
                <select
                  value={formData.ownerId}
                  onChange={e => setFormData({ ...formData, ownerId: e.target.value })}
                  required
                  style={{ width: '100%', padding: 8, boxSizing: 'border-box' }}
                >
                  <option value="">Selecione um dono</option>
                  {owners.map(owner => (
                    <option key={owner.ownerId} value={owner.ownerId}>{owner.nome}</option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: 15 }}>
                <label style={{ display: 'block', marginBottom: 5 }}>Data *</label>
                <input
                  type="date"
                  value={formData.data}
                  onChange={e => setFormData({ ...formData, data: e.target.value })}
                  required
                  style={{ width: '100%', padding: 8, boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ marginBottom: 15 }}>
                <label style={{ display: 'block', marginBottom: 5 }}>Hora *</label>
                <input
                  type="time"
                  value={formData.hora}
                  onChange={e => setFormData({ ...formData, hora: e.target.value })}
                  required
                  style={{ width: '100%', padding: 8, boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ marginBottom: 15 }}>
                <label style={{ display: 'block', marginBottom: 5 }}>Tipo *</label>
                <input
                  type="text"
                  value={formData.tipo}
                  onChange={e => setFormData({ ...formData, tipo: e.target.value })}
                  required
                  placeholder="Ex: Consulta, Vacina, Cirurgia"
                  style={{ width: '100%', padding: 8, boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ marginBottom: 15 }}>
                <label style={{ display: 'block', marginBottom: 5 }}>Status *</label>
                <select
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                  required
                  style={{ width: '100%', padding: 8, boxSizing: 'border-box' }}
                >
                  <option value="pendente">Pendente</option>
                  <option value="confirmado">Confirmado</option>
                  <option value="cancelado">Cancelado</option>
                </select>
              </div>
              <div style={{ marginBottom: 15 }}>
                <label style={{ display: 'block', marginBottom: 5 }}>Observações</label>
                <textarea
                  value={formData.observacoes}
                  onChange={e => setFormData({ ...formData, observacoes: e.target.value })}
                  rows={3}
                  style={{ width: '100%', padding: 8, boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" onClick={resetForm} style={{ padding: '8px 16px', cursor: 'pointer' }}>Cancelar</button>
                <button type="submit" style={{ padding: '8px 16px', cursor: 'pointer' }}>Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
