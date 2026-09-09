import { RouterProvider } from "react-router-dom";
import { ThemeProvider } from "./shared/theme/ThemeProvider";

import { router } from "./app/app.routes";

function App() {
  return (
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}

export default App;
