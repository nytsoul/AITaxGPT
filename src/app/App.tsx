import { RouterProvider } from "react-router";
import { router } from "./routes";
import { ThemeProvider } from "./providers/ThemeProvider";
import { TaxDataProvider } from "./providers/TaxDataProvider";

export default function App() {
  return (
    <ThemeProvider>
      <TaxDataProvider>
        <RouterProvider router={router} />
      </TaxDataProvider>
    </ThemeProvider>
  );
}