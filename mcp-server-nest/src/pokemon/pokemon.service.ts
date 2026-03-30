import { Injectable } from '@nestjs/common';
import axios from 'axios';

interface PokeApiResponse {
  name: string;
  stats: { base_stat: number; stat: { name: string } }[];
  types: { type: { name: string } }[];
  abilities: { ability: { name: string } }[];
}

interface PokeListResponse {
  results: { name: string; url: string }[];
}

interface PokemonStatEntry {
  name: string;
  value: number;
}

@Injectable()
export class PokemonService {
  private readonly POKEAPI_BASE = 'https://pokeapi.co/api/v2';

  async getPokemonInfo(name: string): Promise<string> {
    try {
      const { data } = await axios.get<PokeApiResponse>(
        `${this.POKEAPI_BASE}/pokemon/${name.toLowerCase()}`
      );

      const stats = data.stats.map((s) => `${s.stat.name}: ${s.base_stat}`).join(', ');
      const types = data.types.map((t) => t.type.name).join(', ');
      const abilities = data.abilities.map((a) => a.ability.name).join(', ');

      return `
Name: ${data.name.charAt(0).toUpperCase() + data.name.slice(1)}
Types: ${types}
Abilities: ${abilities}
Stats: ${stats}
      `;
    } catch (error) {
      return `No data found for Pokémon: ${name}`;
    }
  }

  async createTournamentSquad(): Promise<string> {
    const topPokemon = ["charizard", "garchomp", "lucario", "dragonite", "metagross", "gardevoir"];
    const names: string [] = [];

    for (const name of topPokemon) {
      try {
        const { data } = await axios.get<PokeApiResponse>(`${this.POKEAPI_BASE}/pokemon/${name}`);
        names.push(data.name.charAt(0).toUpperCase() + data.name.slice(1));
      } catch (e) { }
    }
    return "Tournament Squad:\n" + names.join('\n');
  }

 // On ajoute 'type' et 'limit' aux paramètres
    async createTeamByCriterion(criterion: string, mode: string, type?: string, limit: number = 6): Promise<string> {
    const { data: listData } = await axios.get<PokeListResponse>(`${this.POKEAPI_BASE}/pokemon?limit=151`);
    let pokemonDetails: PokemonStatEntry[] = [];

    for (const p of listData.results) {
        const { data } = await axios.get<PokeApiResponse>(p.url);
        
        // FILTRE DE TYPE : Si l'IA demande un type, on vérifie si le Pokémon l'a
        if (type && !data.types.some(t => t.type.name === type.toLowerCase())) {
        continue; // On passe au suivant s'il n'est pas du bon type
        }

        const statValue = data.stats.find(s => s.stat.name === criterion.toLowerCase())?.base_stat || 0;
        pokemonDetails.push({ name: data.name, value: statValue });
    }

    // TRI : L'IA choisit le sens
    pokemonDetails.sort((a, b) => mode === 'max' ? b.value - a.value : a.value - b.value);

    const results = pokemonDetails.slice(0, limit);
    return `Results for ${type || 'all'} sorted by ${criterion} (${mode}):\n` + 
            results.map(p => `${p.name}: ${p.value}`).join('\n');
    }
}
