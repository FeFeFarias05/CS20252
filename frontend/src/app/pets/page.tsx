'use client';

import { useState } from 'react';
import { Pet } from '@/types/pet';
import PetCard from '@/components/PetCard';
import PetForm from '@/components/PetForm';

export default function PetsPage() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingPet, setEditingPet] = useState<Pet | null>(null);

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

  return (
    <div className="pets-page">
      <div className="pets-header">
        <h1>🐾 Meus Pets</h1>
        <button className="btn-add" onClick={() => setShowForm(true)}>
          + Adicionar Pet
        </button>
      </div>

      {pets.length === 0 ? (
        <div className="empty-state">
          <p>Você ainda não cadastrou nenhum pet.</p>
          <p>Clique no botão "Adicionar Pet" para começar!</p>
        </div>
      ) : (
        <div className="pets-grid">
          {pets.map(pet => (
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
