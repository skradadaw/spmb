import { useState, useEffect, useCallback, useRef } from 'react';

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

  const fetchedProvinceId = useRef<string | null>(null);
  const fetchedRegencyId = useRef<string | null>(null);
  const fetchedDistrictId = useRef<string | null>(null);

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

  const fetchRegencies = useCallback(async (provinceId: string) => {
    if (!provinceId || fetchedProvinceId.current === provinceId) return;
    fetchedProvinceId.current = provinceId;
    
    setLoading((prev) => ({ ...prev, regencies: true }));
    try {
      const response = await fetch(`${BASE_URL}/regencies/${provinceId}.json`);
      const data = await response.json();
      setRegencies(data);
      setDistricts([]);
      setVillages([]);
      fetchedRegencyId.current = null;
      fetchedDistrictId.current = null;
    } catch (error) {
      console.error('Error fetching regencies:', error);
      fetchedProvinceId.current = null;
    } finally {
      setLoading((prev) => ({ ...prev, regencies: false }));
    }
  }, []);

  const fetchDistricts = useCallback(async (regencyId: string) => {
    if (!regencyId || fetchedRegencyId.current === regencyId) return;
    fetchedRegencyId.current = regencyId;

    setLoading((prev) => ({ ...prev, districts: true }));
    try {
      const response = await fetch(`${BASE_URL}/districts/${regencyId}.json`);
      const data = await response.json();
      setDistricts(data);
      setVillages([]);
      fetchedDistrictId.current = null;
    } catch (error) {
      console.error('Error fetching districts:', error);
      fetchedRegencyId.current = null;
    } finally {
      setLoading((prev) => ({ ...prev, districts: false }));
    }
  }, []);

  const fetchVillages = useCallback(async (districtId: string) => {
    if (!districtId || fetchedDistrictId.current === districtId) return;
    fetchedDistrictId.current = districtId;

    setLoading((prev) => ({ ...prev, villages: true }));
    try {
      const response = await fetch(`${BASE_URL}/villages/${districtId}.json`);
      const data = await response.json();
      setVillages(data);
    } catch (error) {
      console.error('Error fetching villages:', error);
      fetchedDistrictId.current = null;
    } finally {
      setLoading((prev) => ({ ...prev, villages: false }));
    }
  }, []);

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
