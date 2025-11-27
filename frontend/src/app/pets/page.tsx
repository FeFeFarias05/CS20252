'use client';

import { useMemo, useState } from 'react';
import { Pet } from '@/types/pet';
import PetCard from '@/components/PetCard';
import PetForm from '@/components/PetForm';

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

  const [ageGroup, setAgeGroup] = useState<string>('');
  const [searchId, setSearchId] = useState<string>('');

  const handleAddPet = (petData: Omit<Pet, 'id'>) => {
    const newPet: Pet = {
      ...petData,
      id: Date.now().toString(),
    };
    setPets([...pets, newPet]);
    setShowForm(false);
  };

  const handleEditPet = (petData: Omit<Pet, 'id'> & { id?: string }) => {
    if (petData.id) {
      setPets(pets.map(pet => 
        pet.id === petData.id ? { ...petData, id: petData.id } as Pet : pet
      ));
      setEditingPet(null);
      setShowForm(false);
    }
  };

  const handleDeletePet = (id: string) => {
    if (confirm('Tem certeza que deseja remover este pet?')) {
      setPets(pets.filter(pet => pet.id !== id));
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
        <h1>🐾 Meus Pets</h1>
        <button className="btn-add" onClick={() => setShowForm(true)}>
          + Adicionar Pet
        </button>
      </div>

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

      {filteredPets.length === 0 ? (
        <div className="empty-state">
          <p>Você ainda não cadastrou nenhum pet.</p>
          <p>Clique no botão "Adicionar Pet" para começar!</p>
        </div>
      ) : (
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
