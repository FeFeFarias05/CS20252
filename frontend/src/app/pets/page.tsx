'use client';

import { useMemo, useState, useEffect } from 'react';
import { Pet } from '@/types/pet';
import PetCard from '@/components/PetCard';
import PetForm from '@/components/PetForm';
import { api } from '@/lib/api';

const AGE_GROUPS = ['1-3', '4-6', '7-9', '10-12', '13-15', '15+'];

function parseAgeGroup(ageGroup: string | null) {
  if (!ageGroup) return null;
  if (ageGroup === '15+') return { min: 15, max: 30 };
  const [minStr, maxStr] = ageGroup.split('-');
  const min = Number(minStr);
  const max = Number(maxStr);
  if (Number.isNaN(min) || Number.isNaN(max)) return null;
  return { min, max };
}

export default function PetsPage() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingPet, setEditingPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [ageGroup, setAgeGroup] = useState<string>('');
  const [searchId, setSearchId] = useState<string>('');

  // Carregar pets do backend
  useEffect(() => {
    loadPets();
  }, []);

  const loadPets = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.getPets();
      // A API retorna { items: [...], total, page, limit }
      const data = Array.isArray(response) ? response : (response as any).items || [];
      // Converter petId para id para compatibilidade com componentes
      const petsWithId = data.map((p: any) => ({ ...p, id: p.petId }));
      setPets(petsWithId as any);
    } catch (err) {
      setError('Erro ao carregar pets. Verifique se o backend está rodando.');
      console.error('Erro ao carregar pets:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPet = async (petData: Omit<Pet, 'id'>) => {
    try {
      const newPet = await api.createPet(petData as any);
      setPets([...pets, { ...newPet, id: newPet.petId } as any]);
      setShowForm(false);
    } catch (err) {
      alert('Erro ao criar pet: ' + (err as Error).message);
      console.error('Erro ao criar pet:', err);
    }
  };

  const handleEditPet = async (petData: Omit<Pet, 'id'> & { id?: string }) => {
    if (petData.id) {
      try {
        const updated = await api.updatePet(petData.id, petData as any);
        setPets(pets.map(pet => 
          pet.id === petData.id ? { ...updated, id: updated.petId } as any : pet
        ));
        setEditingPet(null);
        setShowForm(false);
      } catch (err) {
        alert('Erro ao atualizar pet: ' + (err as Error).message);
        console.error('Erro ao atualizar pet:', err);
      }
    }
  };

  const handleDeletePet = async (id: string) => {
    if (confirm('Tem certeza que deseja remover este pet?')) {
      try {
        await api.deletePet(id);
        setPets(pets.filter(pet => pet.id !== id));
      } catch (err) {
        alert('Erro ao deletar pet: ' + (err as Error).message);
        console.error('Erro ao deletar pet:', err);
      }
    }
  };

  const openEditForm = (pet: Pet) => {
    setEditingPet(pet);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingPet(null);
  };

  const filteredPets = useMemo(() => {
    const ageRange = parseAgeGroup(ageGroup || null);
    return pets.filter(p => {
      if (searchId && !p.id.toLowerCase().includes(searchId.toLowerCase())) return false;
      if (ageRange) {
        const petAge = Number((p as any).idade ?? (p as any).age ?? 0);
        if (Number.isNaN(petAge)) return false;
        if (petAge < ageRange.min || petAge > ageRange.max) return false;
      }
      return true;
    });
  }, [pets, searchId, ageGroup]);

  return (
    <div className="pets-page">
      <div className="pets-header">
        <h1> Meus Pets</h1>
        <button className="btn-add" onClick={() => setShowForm(true)}>
          + Adicionar Pet
        </button>
      </div>

      {error && (
        <div style={{ padding: 12, backgroundColor: '#fee', border: '1px solid #c00', borderRadius: 4, marginBottom: 12 }}>
          {error}
        </div>
      )}

      {loading && <p>Carregando pets...</p>}

      <div style={{ marginTop: 12, marginBottom: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
        <input
          placeholder="Pesquisar por id"
          value={searchId}
          onChange={e => { setSearchId(e.target.value); }}
          style={{ padding: 6 }}
        />

        <select value={ageGroup} onChange={e => setAgeGroup(e.target.value)} style={{ padding: 6 }}>
          <option value="">Todas as idades</option>
          {AGE_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
        </select>

        <button onClick={() => { setSearchId(''); setAgeGroup(''); }} style={{ padding: 6 }}>
          Limpar filtros
        </button>
      </div>

      {!loading && filteredPets.length === 0 ? (
        <div className="empty-state">
          <p>Você ainda não cadastrou nenhum pet.</p>
          <p>Clique no botão "Adicionar Pet" para começar!</p>
        </div>
      ) : !loading && (
        <div className="pets-grid">
          {filteredPets.map(pet => (
            <PetCard
              key={pet.id}
              pet={pet}
              onEdit={openEditForm}
              onDelete={handleDeletePet}
            />
          ))}
        </div>
      )}

      {showForm && (
        <PetForm
          pet={editingPet}
          onSave={editingPet ? handleEditPet : handleAddPet}
          onCancel={closeForm}
        />
      )}
    </div>
  );
}
