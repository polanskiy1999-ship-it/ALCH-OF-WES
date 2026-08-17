import type { OrderRequest } from "./order-payload";

export type OrderTransportConfig = {
  supabaseUrl: string;
  publishableKey: string;
};

type SubmitOrderOptions = {
  config?: OrderTransportConfig;
  fetchImpl?: typeof fetch;
};

function environmentConfig(): OrderTransportConfig {
  const environment = (
    import.meta as ImportMeta & {
      env?: Record<string, string | undefined>;
    }
  ).env;

  return {
    supabaseUrl: environment?.VITE_SUPABASE_URL?.trim() ?? "",
    publishableKey: environment?.VITE_SUPABASE_PUBLISHABLE_KEY?.trim() ?? "",
  };
}

export async function submitOrderRequest(
  payload: OrderRequest,
  options: SubmitOrderOptions = {},
) {
  const config = options.config ?? environmentConfig();
  const fetchImpl = options.fetchImpl ?? fetch;
  const useSupabase = Boolean(config.supabaseUrl && config.publishableKey);
  const endpoint = useSupabase
    ? `${config.supabaseUrl.replace(/\/$/, "")}/functions/v1/order`
    : "/api/order";
  const headers: Record<string, string> = {
    "content-type": "application/json",
  };

  if (useSupabase) {
    headers.apikey = config.publishableKey;
    headers.authorization = `Bearer ${config.publishableKey}`;
  }

  return fetchImpl(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
}
