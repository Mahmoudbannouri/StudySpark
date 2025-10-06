import Swal from 'sweetalert2';

export const showToast = (message: string, icon: 'success' | 'error' | 'info' = 'success') => {
  Swal.fire({
    toast: true,
    position: 'top-end',
    icon: icon,
    title: message,
    showConfirmButton: false,
    timer: 2000,
    timerProgressBar: true,
    background: '#fff',
  });
};
