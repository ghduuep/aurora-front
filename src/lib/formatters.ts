export function formatPhone(val: string | null | undefined): string {
  if (!val) return '';
  const v = String(val).replace(/\D/g, '').slice(0, 11);
  if (v.length === 11) {
    return v.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3');
  } else if (v.length > 6) {
    return v.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3');
  } else if (v.length > 2) {
    return v.replace(/^(\d{2})(\d{0,5})/, '($1) $2');
  }
  return v;
}

export function formatDocument(val: string | null | undefined): string {
  if (!val) return '';
  let v = String(val).replace(/\D/g, '').slice(0, 14);
  
  if (v.length > 11) {
    // CNPJ
    v = v.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{0,2}).*/, '$1.$2.$3/$4-$5');
  } else {
    // CPF
    if (v.length > 9) {
      v = v.replace(/^(\d{3})(\d{3})(\d{3})(\d{0,2}).*/, '$1.$2.$3-$4');
    } else if (v.length > 6) {
      v = v.replace(/^(\d{3})(\d{3})(\d{0,3}).*/, '$1.$2.$3');
    } else if (v.length > 3) {
      v = v.replace(/^(\d{3})(\d{0,3})/, '$1.$2');
    }
  }
  // Limpa caracteres soltos no final (ex: tracinho sem número)
  return v.replace(/[-./]$/, '');
}

export function unformatNumbers(val: string | null | undefined): string {
  if (!val) return '';
  return String(val).replace(/\D/g, '');
}
