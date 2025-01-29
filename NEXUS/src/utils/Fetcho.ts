import https, { RequestOptions } from "https";
import { HttpMethod } from "../enums";
import { FetchoParams } from "../types";

/**
 * Makes an HTTP request using the specified parameters.
 * 
 * @param {FetchoParams} params - The parameters for the HTTP request.
 * @param {string} params.url - The URL to which the request is sent.
 * @param {HttpMethod} [params.method=HttpMethod.GET] - The HTTP method to use for the request.
 * @param {Record<string, any>} [params.body] - The body of the request, for POST, PUT, and PATCH methods.
 * @param {string} [params.token] - The authorization token to include in the request headers.
 * @param {Record<string, string>} [params.headers={}] - Additional headers to include in the request.
 * @returns {Promise<Record<string, any> | false>} - A promise that resolves to the response data or false if an error occurs.
 * 
 * @example
 * const response = await fetcho({
 *   url: 'https://api.example.com/data',
 *   method: HttpMethod.POST,
 *   body: { key: 'value' },
 *   token: 'your-auth-token',
 *   headers: { 'Custom-Header': 'value' }
 * });
 * console.log(response);
 */
const fetcho = ({
  url,
  method = HttpMethod.GET,
  body,
  token,
  headers = {},
}: FetchoParams): Promise<Record<string, any> | false> => {
  const urlObj = new URL(url);

  const defaultHeaders = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const requestOptions: RequestOptions = {
    protocol: urlObj.protocol,
    hostname: urlObj.hostname,
    port: urlObj.port || (urlObj.protocol === "https:" ? 443 : 80),
    path: urlObj.pathname + urlObj.search,
    method: method,
    headers: {
      ...defaultHeaders,
      ...headers,
    },
  };

  return new Promise((resolve, reject) => {
    const req = https
      .request(requestOptions, (res) => {
        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => {
          if (data === "") {
            reject(new Error("Empty response from server"));
            return;
          }

          try {
            const parsedData = JSON.parse(data);

            if (!res.statusCode) return;

            if (res.statusCode < 200 || res.statusCode >= 300) {
              reject(
                new Error(`Server error with status code ${res.statusCode}`)
              );
              return;
            }

            resolve(parsedData);
          } catch (error) {
            reject(new Error(`Error parsing response: ${error}`));
          }
        });
      })
      .on("error", (error) => {
        console.log(url);
        reject(error);
      });

    if (
      body &&
      (method === HttpMethod.POST ||
        method === HttpMethod.PUT ||
        method === HttpMethod.PATCH)
    ) {
      if (headers["Content-Type"] === "application/x-www-form-urlencoded") {
        req.write(body);
      } else {
        req.write(JSON.stringify(body));
      }
    }

    req.end();
  });
};

export default fetcho;