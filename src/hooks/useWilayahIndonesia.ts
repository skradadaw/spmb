import { useState, useEffect } from 'react';

const BASE_URL = 'https://www.emsifa.com/api-wilayah-indonesia/api';

export interface Region {
  id: string;
  name: string;
}

export function useWilayahIndonesia() {
  const [provinces, setProvinces] = useState<Region[]>([]);
  const [regencies, setRegencies] = useState<Region[]>([]);
  const [districts, setDistricts] = useState<Region[]>([]);
  const [villages, setVillages] = useState<Region[]>([]);

  const [loading, setLoading] = useState({
    provinces: false,
    regencies: false,
    districts: false,
    villages: false,
  });

  // Fetch provinces on mount
  useEffect(() => {
    const fetchProvinces = async () => {
      setLoading((prev) => ({ ...prev, provinces: true }));
      try {
        const response = await fetch(`${BASE_URL}/provinces.json`);
        const data = await response.json();
        setProvinces(data);
      } catch (error) {
        console.error('Error fetching provinces:', error);
      } finally {
        setLoading((prev) => ({ ...prev, provinces: false }));
      }
    };
    fetchProvinces();
  }, []);

  const fetchRegencies = async (provinceId: string) => {
    setRegencies([]);
    setDistricts([]);
    setVillages([]);
    if (!provinceId) return;
    
    setLoading((prev) => ({ ...prev, regencies: true }));
    try {
      const response = await fetch(`${BASE_URL}/regencies/${provinceId}.json`);
      const data = await response.json();
      setRegencies(data);
    } catch (error) {
      console.error('Error fetching regencies:', error);
    } finally {
      setLoading((prev) => ({ ...prev, regencies: false }));
    }
  };

  const fetchDistricts = async (regencyId: string) => {
    setDistricts([]);
    setVillages([]);
    if (!regencyId) return;

    setLoading((prev) => ({ ...prev, districts: true }));
    try {
      const response = await fetch(`${BASE_URL}/districts/${regencyId}.json`);
      const data = await response.json();
      setDistricts(data);
    } catch (error) {
      console.error('Error fetching districts:', error);
    } finally {
      setLoading((prev) => ({ ...prev, districts: false }));
    }
  };

  const fetchVillages = async (districtId: string) => {
    setVillages([]);
    if (!districtId) return;

    setLoading((prev) => ({ ...prev, villages: true }));
    try {
      const response = await fetch(`${BASE_URL}/villages/${districtId}.json`);
      const data = await response.json();
      setVillages(data);
    } catch (error) {
      console.error('Error fetching villages:', error);
    } finally {
      setLoading((prev) => ({ ...prev, villages: false }));
    }
  };

  return {
    provinces,
    regencies,
    districts,
    villages,
    loading,
    fetchRegencies,
    fetchDistricts,
    fetchVillages,
  };
}
