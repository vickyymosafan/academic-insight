import {
  validateStudentData,
  isValidNIM,
  isValidIPK,
  isValidSemester,
  isValidAngkatan,
  sanitizeString,
  sanitizeObject
} from '../validation';

describe('Validation Utilities', () => {
  describe('isValidNIM', () => {
    it('should accept valid NIM with 8 digits', () => {
      expect(isValidNIM('12345678')).toBe(true);
    });

    it('should accept valid NIM with 12 digits', () => {
      expect(isValidNIM('123456789012')).toBe(true);
    });

    it('should reject NIM with less than 8 digits', () => {
      expect(isValidNIM('1234567')).toBe(false);
    });

    it('should reject NIM with more than 12 digits', () => {
      expect(isValidNIM('1234567890123')).toBe(false);
    });

    it('should reject NIM with non-numeric characters', () => {
      expect(isValidNIM('12345abc')).toBe(false);
    });
  });

  describe('isValidIPK', () => {
    it('should accept IPK of 0.00', () => {
      expect(isValidIPK(0)).toBe(true);
      expect(isValidIPK('0.00')).toBe(true);
    });

    it('should accept IPK of 4.00', () => {
      expect(isValidIPK(4)).toBe(true);
      expect(isValidIPK('4.00')).toBe(true);
    });

    it('should accept IPK between 0 and 4', () => {
      expect(isValidIPK(3.5)).toBe(true);
      expect(isValidIPK('2.75')).toBe(true);
    });

    it('should reject IPK less than 0', () => {
      expect(isValidIPK(-0.1)).toBe(false);
    });

    it('should reject IPK greater than 4', () => {
      expect(isValidIPK(4.1)).toBe(false);
    });

    it('should reject non-numeric IPK', () => {
      expect(isValidIPK('abc')).toBe(false);
    });
  });

  describe('isValidSemester', () => {
    it('should accept semester 1', () => {
      expect(isValidSemester(1)).toBe(true);
    });

    it('should accept semester 14', () => {
      expect(isValidSemester(14)).toBe(true);
    });

    it('should accept semester between 1 and 14', () => {
      expect(isValidSemester(7)).toBe(true);
    });

    it('should reject semester 0', () => {
      expect(isValidSemester(0)).toBe(false);
    });

    it('should reject semester greater than 14', () => {
      expect(isValidSemester(15)).toBe(false);
    });
  });

  describe('isValidAngkatan', () => {
    const currentYear = new Date().getFullYear();

    it('should accept year 2000', () => {
      expect(isValidAngkatan(2000)).toBe(true);
    });

    it('should accept current year', () => {
      expect(isValidAngkatan(currentYear)).toBe(true);
    });

    it('should reject year before 2000', () => {
      expect(isValidAngkatan(1999)).toBe(false);
    });

    it('should reject year after current year', () => {
      expect(isValidAngkatan(currentYear + 1)).toBe(false);
    });
  });

  describe('sanitizeString', () => {
    it('should remove HTML tags', () => {
      expect(sanitizeString('<div>text</div>')).toBe('text');
    });

    it('should remove event handlers', () => {
      expect(sanitizeString('text onclick="alert()"')).toBe('text');
    });

    it('should remove javascript: protocol', () => {
      expect(sanitizeString('javascript:alert()')).toBe('alert()');
    });

    it('should trim whitespace', () => {
      expect(sanitizeString('  text  ')).toBe('text');
    });

    it('should handle empty string', () => {
      expect(sanitizeString('')).toBe('');
    });
  });

  describe('sanitizeObject', () => {
    it('should sanitize all string values', () => {
      const input = {
        name: '<div>John</div>',
        nim: '12345678'
      };
      const result = sanitizeObject(input);
      expect(result.name).toBe('John');
      expect(result.nim).toBe('12345678');
    });

    it('should preserve non-string values', () => {
      const input = {
        name: 'John',
        age: 20,
        active: true
      };
      const result = sanitizeObject(input);
      expect(result.age).toBe(20);
      expect(result.active).toBe(true);
    });
  });

  describe('validateStudentData', () => {
    const validData = {
      nim: '12345678',
      name: 'John Doe',
      program_studi: 'Teknik Informatika',
      angkatan: 2023,
      ipk: 3.5,
      semester_current: 5,
      status: 'aktif'
    };

    describe('Create validation (isUpdate = false)', () => {
      it('should pass validation with all valid data', () => {
        const result = validateStudentData(validData, false);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it('should fail when NIM is missing', () => {
        const data = { ...validData, nim: '' };
        const result = validateStudentData(data, false);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContainEqual({
          field: 'nim',
          message: 'NIM wajib diisi'
        });
      });

      it('should fail when NIM is invalid', () => {
        const data = { ...validData, nim: '123' };
        const result = validateStudentData(data, false);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContainEqual({
          field: 'nim',
          message: 'NIM harus berupa angka 8-12 digit'
        });
      });

      it('should fail when name is missing', () => {
        const data = { ...validData, name: '' };
        const result = validateStudentData(data, false);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContainEqual({
          field: 'name',
          message: 'Nama wajib diisi'
        });
      });

      it('should fail when name is too short', () => {
        const data = { ...validData, name: 'A' };
        const result = validateStudentData(data, false);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContainEqual({
          field: 'name',
          message: 'Nama minimal 2 karakter'
        });
      });

      it('should fail when program_studi is missing', () => {
        const data = { ...validData, program_studi: '' };
        const result = validateStudentData(data, false);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContainEqual({
          field: 'program_studi',
          message: 'Program studi wajib diisi'
        });
      });

      it('should fail when IPK is invalid', () => {
        const data = { ...validData, ipk: 5.0 };
        const result = validateStudentData(data, false);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContainEqual({
          field: 'ipk',
          message: 'IPK harus antara 0.00 - 4.00'
        });
      });

      it('should fail when semester is invalid', () => {
        const data = { ...validData, semester_current: 15 };
        const result = validateStudentData(data, false);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContainEqual({
          field: 'semester_current',
          message: 'Semester harus antara 1 - 14'
        });
      });

      it('should fail when angkatan is missing', () => {
        const data = { ...validData, angkatan: undefined };
        const result = validateStudentData(data, false);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContainEqual({
          field: 'angkatan',
          message: 'Angkatan wajib diisi'
        });
      });

      it('should fail when angkatan is invalid', () => {
        const data = { ...validData, angkatan: 1999 };
        const result = validateStudentData(data, false);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContainEqual({
          field: 'angkatan',
          message: 'Angkatan tidak valid'
        });
      });

      it('should fail when status is invalid', () => {
        const data = { ...validData, status: 'invalid' };
        const result = validateStudentData(data, false);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContainEqual({
          field: 'status',
          message: 'Status tidak valid'
        });
      });

      it('should pass with valid status values', () => {
        const statuses = ['aktif', 'lulus', 'dropout', 'cuti'];
        statuses.forEach(status => {
          const data = { ...validData, status };
          const result = validateStudentData(data, false);
          expect(result.isValid).toBe(true);
        });
      });
    });

    describe('Update validation (isUpdate = true)', () => {
      it('should pass validation with partial data', () => {
        const data = { name: 'Jane Doe' };
        const result = validateStudentData(data, true);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it('should not require NIM for update', () => {
        const data = { name: 'Jane Doe' };
        const result = validateStudentData(data, true);
        expect(result.isValid).toBe(true);
      });

      it('should still validate NIM if provided', () => {
        const data = { nim: '123' };
        const result = validateStudentData(data, true);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContainEqual({
          field: 'nim',
          message: 'NIM harus berupa angka 8-12 digit'
        });
      });

      it('should validate IPK if provided', () => {
        const data = { ipk: 5.0 };
        const result = validateStudentData(data, true);
        expect(result.isValid).toBe(false);
      });
    });

    describe('XSS Protection', () => {
      it('should sanitize malicious input', () => {
        const data = {
          ...validData,
          name: '<script>alert("xss")</script>John Doe'
        };
        const result = validateStudentData(data, false);
        // The validation should work on sanitized data
        expect(result.isValid).toBe(true);
      });
    });
  });
});
