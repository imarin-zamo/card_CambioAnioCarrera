import { useState, useCallback } from "react";
import { useData } from "@ellucian/experience-extension-utils";

export function useZamoranoData() {

    const baseUrl = process.env.URL_APISIS;

    const { getExtensionJwt } = useData();

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const execute = useCallback(
        async (endpoint, options = {}) => {
            setLoading(true);
            setError(null);
            setData(null);

            try {
                if (!baseUrl) throw new Error("URL_APISIS no está configurada");

                const token = await getExtensionJwt();
                const response = await fetch(`${baseUrl}${endpoint}`, {
                    credentials: "include",
                    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", ...options.headers },
                    ...options,
                    body: options.body ? JSON.stringify(options.body) : undefined,
                });

                // const json = await response.json();

                const text = await response.text(); // Leemos como texto plano primero

                // console.log("Respuesta cruda del servidor:", text);

                if (!text) {
                    // console.warn("El servidor devolvió un cuerpo vacío.");
                    setData([]);
                    return null;
                }

                const json = JSON.parse(text); // Convertimos manualmente a JSON
                // ----------------------------

                if (!response.ok) {
                    throw new Error(`Error ${json.status}: ${json.response}`);
                }

                if (!response.ok) {
                    throw new Error(`Error ${json.status}: ${json.response}`);
                }

                const responseData = json.response;

                setData(responseData);
                return responseData;
            } catch (err) {
                setError(err.message || "Error desconocido");
                return null;
            } finally {
                setLoading(false);
            }
        },
        [baseUrl, getExtensionJwt]
    );

    const clearData = useCallback(() => {
        setData(null);
        setError(null);
        setLoading(false);
    }, []);

    return { data, loading, error, execute, clearData };
}