'use client';

import { Pet } from '@/types/pet';
import Image from 'next/image';

interface PetCardProps {
  pet: Pet;
  onEdit: (pet: Pet) => void;
  onDelete: (id: string) => void;
}

export default function PetCard({ pet, onEdit, onDelete }: PetCardProps) {
  return (
    <div className="pet-card">
      <div className="pet-card-header">
        <div className="pet-photo">
          {pet.foto ? (
            <img src={pet.foto} alt={pet.nome} />
          ) : (
            <div className="pet-photo-placeholder">🐾</div>
          )}
        </div>
        <h2>{pet.nome}</h2>
        <h3>ID: {pet.id}</h3>
      </div>
      
      <div className="pet-info">
        <div className="info-row">
          <span className="label">Idade:</span>
          <span className="value">{pet.idade} {pet.idade === 1 ? 'ano' : 'anos'}</span>
        </div>
        <div className="info-row">
          <span className="label">Raça:</span>
          <span className="value">{pet.raca}</span>
        </div>
        <div className="info-row">
          <span className="label">Peso:</span>
          <span className="value">{pet.peso} kg</span>
        </div>
        <div className="info-row">
          <span className="label">Medicações:</span>
          <span className="value">{pet.medicacoes || 'Nenhuma'}</span>
        </div>
        <div className="info-row">
          <span className="label">Informações:</span>
          <span className="value">{pet.informacoes || 'Sem informações adicionais'}</span>
        </div>
      </div>
      
      <div className="pet-card-actions">
        <button className="btn-edit" onClick={() => onEdit(pet)}>
          ✏️ Editar
        </button>
        <button className="btn-delete" onClick={() => onDelete(pet.id)}>
          🗑️ Remover
        </button>
      </div>
    </div>
  );
}
