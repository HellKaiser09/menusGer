import { supabase } from '../lib/supabase';

export async function isAuthenticated(request: Request, cookies: any) {
  const accessToken = cookies.get('sb-access-token')?.value;
  const refreshToken = cookies.get('sb-refresh-token')?.value;

  if (!accessToken || !refreshToken) {
    console.log('❌ No hay tokens en las cookies');
    return;
  }

  console.log('🔍 Verificando autenticación con tokens existentes');

  try {
    // Verificar si el token es válido
    const { data, error } = await supabase.auth.getUser(accessToken);

    if (error || !data?.user) {
      console.warn('⚠️ Token inválido, intentando refrescar sesión...');
      
      // Intentar refrescar la sesión
      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession({
        refresh_token: refreshToken,
      });

      if (refreshError || !refreshData?.session) {
        console.error('🚨 Error al refrescar sesión:', refreshError?.message || 'No se pudo obtener una nueva sesión');
        return false;
      }

      console.log('✅ Sesión refrescada correctamente, actualizando cookies');

      // Actualizar cookies con los nuevos tokens
      cookies.set('sb-access-token', refreshData.session.access_token, {
        path: '/',
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: refreshData.session.expires_in,
      });

      cookies.set('sb-refresh-token', refreshData.session.refresh_token, {
        path: '/',
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 30,
      });

      return true;
    }

    console.log('✅ Token válido, verificando rol de usuario');

    // Verificar si el usuario es administrador
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', data.user.id)
      .single();

    console.log('✅ Usuario autenticado correctamente');
    return true;
  } catch (e) {
    console.error('🚨 Error inesperado en autenticación:', e);
    return false;
  }
}
