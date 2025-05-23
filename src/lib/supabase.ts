import { createClient } from '@supabase/supabase-js';

// Obtener las variables de entorno
const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

/**
 * Crea un cliente de Supabase con opciones personalizadas
 * @param {string} accessToken - Token de acceso opcional para autenticación
 * @param {string} refreshToken - Token de actualización opcional para renovar la sesión
 * @returns Cliente de Supabase configurado
 */
export function createSupabaseClient(accessToken?: string, refreshToken?: string) {
  const options = {};
  
  // Si se proporcionan tokens, configurar opciones de autenticación
  if (accessToken && refreshToken) {
    Object.assign(options, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false
      },
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    });
  }
  
  return createClient(supabaseUrl, supabaseKey, options);
}

// Crear el cliente de Supabase por defecto
export const supabase = createClient(supabaseUrl, supabaseKey);

// Interfaz para las cafeterías
export interface Cafeteria {
  id: number;
  name: string;
  rating: number;
  reviewCount: number;
  priceRange: string;
  address: string;
  hours: string;
  services: string[];
  image: string;
  menu?: string;
  distance?: string;
  closed?: boolean;
  openingTime?: string;
  featured?: boolean;
}

// Función para obtener todas las cafeterías
export async function getCafeterias() {
  const { data, error } = await supabase
    .from('restaurants')
    .select('*')
  if (error) {
    console.error('Error fetching cafeterias:', error);
    return [];
  }
  return data as Cafeteria[];
}

// Función para obtener cafeterías destacadas
export async function getCafeteriasDestacadas() {
  const { data, error } = await supabase
    .from('cafeterias')
    .select('*')
    .eq('featured', true);
  
  if (error) {
    console.error('Error fetching featured cafeterias:', error);
    return [];
  }
  
  return data as Cafeteria[];
}

// Función para obtener opiniones de una cafetería
export async function getOpinionesCafeteria(cafeteriaId: number) {
  const { data, error } = await supabase
    .from('opiniones')
    .select('*')
    .eq('cafeteria_id', cafeteriaId);
  
  if (error) {
    console.error('Error fetching opinions:', error);
    return [];
  }
  
  return data;
}