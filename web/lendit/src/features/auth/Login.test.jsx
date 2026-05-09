import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Login from "./Login";

jest.mock("../../lib/supabase", () => ({
  supabase: {
    auth: {
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } },
      })),
      signInWithOAuth: jest.fn(),
    },
  },
}));

jest.mock("../../shared/components/SuccessPopup", () =>
  ({ title, onClose }) => (
    <div data-testid="success-popup">
      <span>{title}</span>
      <button onClick={onClose}>Continue</button>
    </div>
  )
);

const renderLogin = (setUser = jest.fn()) =>
  render(
    <MemoryRouter>
      <Login setUser={setUser} />
    </MemoryRouter>
  );

describe("Login", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  test("renders email and password inputs", () => {
    renderLogin();
    expect(screen.getByPlaceholderText("Email address")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
  });

  test("renders login submit button", () => {
    renderLogin();
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
  });

  test("renders Continue with Google button", () => {
    renderLogin();
    expect(screen.getByRole("button", { name: /continue with google/i })).toBeInTheDocument();
  });

  test("shows success popup on successful login", async () => {
    const mockUser = { id: 1, fName: "John", lName: "Doe", role: "USER" };
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({ token: "abc123", user: mockUser }),
    });

    const setUser = jest.fn();
    renderLogin(setUser);

    fireEvent.change(screen.getByPlaceholderText("Email address"), {
      target: { value: "john@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByTestId("success-popup")).toBeInTheDocument();
    });
    expect(screen.getByText("Welcome Back!")).toBeInTheDocument();
  });

  test("does not show success popup on failed login", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      text: async () => JSON.stringify("Invalid credentials"),
    });

    const alertMock = jest.spyOn(window, "alert").mockImplementation(() => {});
    renderLogin();

    fireEvent.change(screen.getByPlaceholderText("Email address"), {
      target: { value: "bad@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "wrongpass" },
    });
    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(screen.queryByTestId("success-popup")).not.toBeInTheDocument();
    });

    alertMock.mockRestore();
  });

  test("toggles password visibility", () => {
    renderLogin();
    const passwordInput = screen.getByPlaceholderText("Password");
    expect(passwordInput).toHaveAttribute("type", "password");

    const toggleBtn = screen.getByRole("button", { name: "" });
    fireEvent.click(toggleBtn);
    expect(passwordInput).toHaveAttribute("type", "text");
  });
});
