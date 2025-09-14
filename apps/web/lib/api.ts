import createClient from "openapi-fetch";
import { paths } from "../generated/openapi";

const api = createClient<paths>({ baseUrl: "https://localhost:3001/api/" });

api.GET("/habits/{id}", {
  params: {
    path: {
      id: "asd",
    },
  },
});
