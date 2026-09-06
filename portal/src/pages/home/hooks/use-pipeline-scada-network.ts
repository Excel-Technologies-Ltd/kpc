import { useFrappeGetCall } from 'frappe-react-sdk';
import { useMemo } from 'react';

export interface ScadaTankInfo {
  id: string;
  code: string;
  name: string;
  terminal: string;
  product: string;
  current_state: string;
  capacity_kl: number;
  current_stock_kl: number;
  ullage_kl: number;
  fill_pct: number;
  last_updated?: string | null;
}

export interface ScadaTerminalNode {
  terminal_code: string;
  terminal_name: string;
  terminal_type: string;
  latitude: number | null;
  longitude: number | null;
  is_active: boolean;
  total_capacity_kl: number;
  current_stock_kl: number;
  ullage_kl: number;
  fill_pct: number;
  primary_product: string;
  status: string;
  tanks: ScadaTankInfo[];
}

export interface ScadaTelemetry {
  trunk_name: string;
  flow_rate_m3h: number;
  pressure_bar: number;
  alert_active: boolean;
  anomaly_severity: string;
  status_label: string;
  watch_segment: string;
}

export interface ScadaSegment {
  id: string;
  name: string;
  from_node: string;
  to_node: string;
  is_active: boolean;
  flow_rate_m3h: number;
  status: 'Normal' | 'Watch' | 'Standby';
  color: string;
}

export interface ScadaNetworkApiResponse {
  terminals: ScadaTerminalNode[];
  telemetry: ScadaTelemetry;
  segments: ScadaSegment[];
}

export function usePipelineScadaNetwork() {
  const { data, isLoading, error, mutate } = useFrappeGetCall<
    { message?: ScadaNetworkApiResponse } | ScadaNetworkApiResponse
  >('kpc.petroleum_operations.api.get_pipeline_scada_network');

  const parsedData = useMemo<ScadaNetworkApiResponse | null>(() => {
    if (!data) return null;
    if ('message' in data && data.message) {
      return data.message;
    }
    if ('terminals' in data) {
      return data as ScadaNetworkApiResponse;
    }
    return null;
  }, [data]);

  return {
    data: parsedData,
    isLoading,
    error,
    mutate,
  };
}
