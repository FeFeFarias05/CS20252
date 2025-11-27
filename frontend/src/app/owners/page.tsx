'use client';

import { useState, useEffect } from 'react';
import { api, Owner } from '@/lib/api';

export default function OwnersPage() {
  const [owners, setOwners] = useState<Owner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingOwner, setEditingOwner] = useState<Owner | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    endereco: ''
  });

  useEffect(() => {
    loadOwners();
  }, []);

  const loadOwners = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.getOwners();
      const data = Array.isArray(response) ? response : (response as any).items || [];
      setOwners(data);
    } catch (err) {
      setError('Erro ao carregar donos. Verifique se o backend está rodando.');
      console.error('Erro ao carregar donos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingOwner) {
        const updated = await api.updateOwner(editingOwner.ownerId, formData);
        setOwners(owners.map(o => o.ownerId === updated.ownerId ? updated : o));
      } else {
        const created = await api.createOwner(formData);
        setOwners([...owners, created]);
      }
      resetForm();
    } catch (err) {
      alert('Erro ao salvar: ' + (err as Error).message);
    }
  };

  const handleEdit = (owner: Owner) => {
    setEditingOwner(owner);
    setFormData({
      nome: owner.nome,
      email: owner.email,
      telefone: owner.telefone || '',
      endereco: owner.endereco || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja remover este dono?')) {
      try {
        await api.deleteOwner(id);
        setOwners(owners.filter(o => o.ownerId !== id));
      } catch (err) {
        alert('Erro ao deletar: ' + (err as Error).message);
      }
    }
  };

  const resetForm = () => {
    setFormData({ nome: '', email: '', telefone: '', endereco: '' });
    setEditingOwner(null);
    setShowForm(false);
  };

  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <h1>Donos de Pets</h1>
        <button onClick={() => setShowForm(true)} style={{ padding: '10px 20px', cursor: 'pointer' }}>
          + Adicionar Dono
        </button>
      </div>

      {error && (
        <div style={{ padding: 12, backgroundColor: '#fee', border: '1px solid #c00', borderRadius: 4, marginBottom: 12 }}>
          {error}
        </div>
      )}

      {loading && <p>Carregando...</p>}

      {!loading && owners.length === 0 ? (
        <p>Nenhum dono cadastrado.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f0f0f0' }}>
              <th style={{ padding: 10, textAlign: 'left', border: '1px solid #ddd' }}>Nome</th>
              <th style={{ padding: 10, textAlign: 'left', border: '1px solid #ddd' }}>Email</th>
              <th style={{ padding: 10, textAlign: 'left', border: '1px solid #ddd' }}>Telefone</th>
              <th style={{ padding: 10, textAlign: 'left', border: '1px solid #ddd' }}>Endereço</th>
              <th style={{ padding: 10, textAlign: 'left', border: '1px solid #ddd' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {owners.map(owner => (
              <tr key={owner.ownerId}>
                <td style={{ padding: 10, border: '1px solid #ddd' }}>{owner.nome}</td>
                <td style={{ padding: 10, border: '1px solid #ddd' }}>{owner.email}</td>
                <td style={{ padding: 10, border: '1px solid #ddd' }}>{owner.telefone || '-'}</td>
                <td style={{ padding: 10, border: '1px solid #ddd' }}>{owner.endereco || '-'}</td>
                <td style={{ padding: 10, border: '1px solid #ddd' }}>
                  <button onClick={() => handleEdit(owner)} style={{ marginRight: 8, cursor: 'pointer' }}>Editar</button>
                  <button onClick={() => handleDelete(owner.ownerId)} style={{ cursor: 'pointer' }}>Deletar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showForm && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ backgroundColor: 'white', padding: 30, borderRadius: 8, width: 500, maxWidth: '90%' }}>
            <h2>{editingOwner ? 'Editar Dono' : 'Novo Dono'}</h2>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 15 }}>
                <label style={{ display: 'block', marginBottom: 5 }}>Nome *</label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={e => setFormData({ ...formData, nome: e.target.value })}
                  required
                  style={{ width: '100%', padding: 8, boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ marginBottom: 15 }}>
                <label style={{ display: 'block', marginBottom: 5 }}>Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  required
                  style={{ width: '100%', padding: 8, boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ marginBottom: 15 }}>
                <label style={{ display: 'block', marginBottom: 5 }}>Telefone</label>
                <input
                  type="text"
                  value={formData.telefone}
                  onChange={e => setFormData({ ...formData, telefone: e.target.value })}
                  style={{ width: '100%', padding: 8, boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ marginBottom: 15 }}>
                <label style={{ display: 'block', marginBottom: 5 }}>Endereço</label>
                <input
                  type="text"
                  value={formData.endereco}
                  onChange={e => setFormData({ ...formData, endereco: e.target.value })}
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
