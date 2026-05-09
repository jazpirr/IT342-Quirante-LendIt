import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import HomePage from "./Homepage";

jest.mock("../items/AddItemModal", () => () => <div data-testid="add-item-modal" />);
jest.mock("../items/ItemViewModal", () => () => <div data-testid="item-view-modal" />);
jest.mock("../../shared/components/SuccessPopup", () => () => null);
jest.mock("../items/MyItems", () => () => null);
jest.mock("../profile/ProfilePage", () => () => null);

const mockUser = { id: 1, fName: "Alice", lName: "Smith", role: "USER" };

const renderHomePage = (user = mockUser) =>
  render(
    <MemoryRouter>
      <HomePage user={user} onLogout={jest.fn()} />
    </MemoryRouter>
  );

describe("HomePage", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    global.fetch = jest.fn((url) => {
      if (url.includes("/api/items/my")) {
        return Promise.resolve({
          ok: true,
          json: async () => [
            { itemId: 10, name: "My Camera", ownerId: 1, availability: "AVAILABLE" },
          ],
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => [
          { itemId: 1, name: "Camera", description: "DSLR", ownerId: 2, availability: "AVAILABLE" },
          { itemId: 2, name: "Projector", description: "HD", ownerId: 3, availability: "AVAILABLE" },
        ],
      });
    });
  });

  test("renders welcome message with user first name", async () => {
    renderHomePage();
    await waitFor(() => {
      expect(screen.getByText(/Welcome back, Alice!/i)).toBeInTheDocument();
    });
  });

  test("renders search input", async () => {
    renderHomePage();
    expect(screen.getByPlaceholderText(/search items to borrow/i)).toBeInTheDocument();
  });

  test("renders available items from API", async () => {
    renderHomePage();
    await waitFor(() => {
      expect(screen.getByText("Camera")).toBeInTheDocument();
      expect(screen.getByText("Projector")).toBeInTheDocument();
    });
  });

  test("filters items when user types in search", async () => {
    renderHomePage();
    await waitFor(() => {
      expect(screen.getByText("Camera")).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText(/search items to borrow/i), {
      target: { value: "camera" },
    });

    await waitFor(() => {
      expect(screen.getByText("Camera")).toBeInTheDocument();
      expect(screen.queryByText("Projector")).not.toBeInTheDocument();
    });
  });

  test("shows empty state when no items match search", async () => {
    renderHomePage();
    await waitFor(() => {
      expect(screen.getByText("Camera")).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText(/search items to borrow/i), {
      target: { value: "nonexistent xyz" },
    });

    await waitFor(() => {
      expect(screen.getByText(/no items match your search/i)).toBeInTheDocument();
    });
  });

  test("does not show own items in the list", async () => {
    const fetchMock = jest.fn((url) => {
      if (url.includes("/api/items/my")) {
        return Promise.resolve({ ok: true, json: async () => [] });
      }
      return Promise.resolve({
        ok: true,
        json: async () => [
          { itemId: 1, name: "My Own Item", ownerId: 1, availability: "AVAILABLE" },
          { itemId: 2, name: "Other Item", ownerId: 2, availability: "AVAILABLE" },
        ],
      });
    });
    global.fetch = fetchMock;

    renderHomePage();
    await waitFor(() => {
      expect(screen.queryByText("My Own Item")).not.toBeInTheDocument();
      expect(screen.getByText("Other Item")).toBeInTheDocument();
    });
  });
});
