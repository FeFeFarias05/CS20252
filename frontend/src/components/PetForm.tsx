'use client';

import { Pet } from '@/types/pet';
import { useState, useEffect } from 'react';

interface PetFormProps {
  pet?: Pet | null;
  onSave: (pet: Omit<Pet, 'id'> & { id?: string }) => void;
  onCancel: () => void;
}

export default function PetForm({ pet, onSave, onCancel }: PetFormProps) {
  const [formData, setFormData] = useState({
    nome: '',
    foto: '',
    idade: 0,
    raca: '',
    peso: 0,
    medicacoes: '',
    informacoes: '',
  });

  useEffect(() => {
    if (pet) {
      setFormData({
        nome: pet.nome,
        foto: pet.foto,
        idade: pet.idade,
        raca: pet.raca,
        peso: pet.peso,
        medicacoes: pet.medicacoes,
        informacoes: pet.informacoes,
      });
    }
  }, [pet]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(pet ? { ...formData, id: pet.id } : formData);
    setFormData({
      nome: '',
      foto: '',
      idade: 0,
      raca: '',
      peso: 0,
      medicacoes: '',
      informacoes: '',
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'idade' || name === 'peso' ? parseFloat(value) || 0 : value
    }));
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{pet ? 'Editar Pet' : 'Adicionar Novo Pet'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="nome">Nome *</label>
            <input
              type="text"
              id="nome"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="foto">URL da Foto</label>
            <input
              type="text"
              id="foto"
              name="foto"
              value={formData.foto}
              onChange={handleChange}
              placeholder="https://exemplo.com/foto.jpg"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="idade">Idade (anos) *</label>
              <input
                type="number"
                id="idade"
                name="idade"
                value={formData.idade}
                onChange={handleChange}
                min="0"
                step="1"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="peso">Peso (kg) *</label>
              <input
                type="number"
                id="peso"
                name="peso"
                value={formData.peso}
                onChange={handleChange}
                min="0"
                step="0.1"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="raca">Raça *</label>
            <input
              type="text"
              id="raca"
              name="raca"
              value={formData.raca}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="medicacoes">Medicações</label>
            <textarea
              id="medicacoes"
              name="medicacoes"
              value={formData.medicacoes}
              onChange={handleChange}
              rows={3}
              placeholder="Descreva as medicações do pet..."
            />
          </div>

          <div className="form-group">
            <label htmlFor="informacoes">Informações Adicionais</label>
            <textarea
              id="informacoes"
              name="informacoes"
              value={formData.informacoes}
              onChange={handleChange}
              rows={4}
              placeholder="Outras informações importantes sobre o pet..."
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={onCancel}>
              Cancelar
            </button>
            <button type="submit" className="btn-save">
              {pet ? 'Salvar Alterações' : 'Adicionar Pet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
