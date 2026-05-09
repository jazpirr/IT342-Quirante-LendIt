import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import ItemViewModal from "./ItemViewModal";

jest.mock("../reports/ReportModal", () =>
  ({ onClose }) => (
    <div data-testid="report-modal">
      <button onClick={onClose}>Close</button>
    </div>
  )
);

const mockItem = {
  itemId: 1,
  name: "DSLR Camera",
  description: "Professional camera for rent",
  ownerId: 2,
  ownerName: "Bob Smith",
  imageUrl: null,
  availability: "AVAILABLE",
};

const mockUser = { id: 1, fName: "Alice", lName: "Johnson" };
const mockOwnerUser = { id: 2, fName: "Bob", lName: "Smith" };

const renderModal = (props = {}) =>
  render(
    <ItemViewModal
      item={mockItem}
      user={mockUser}
      onClose={jest.fn()}
      onBorrow={jest.fn()}
      onMessage={jest.fn()}
      {...props}
    />
  );

describe("ItemViewModal", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn((url) => {
      if (url.includes("/api/requests/item/")) {
        return Promise.resolve({ ok: true, json: async () => [] });
      }
      if (url.includes("/images")) {
        return Promise.resolve({ ok: true, json: async () => [] });
      }
      return Promise.resolve({ ok: true, json: async () => [] });
    });
  });

  test("renders item name in header", async () => {
    renderModal();
    expect(screen.getByText("DSLR Camera")).toBeInTheDocument();
  });

  test("renders Item Details subtitle", () => {
    renderModal();
    expect(screen.getByText("Item Details")).toBeInTheDocument();
  });

  test("shows borrow and message buttons when not viewOnly", async () => {
    renderModal();
    await waitFor(() => {
      expect(screen.getByText(/borrow/i)).toBeInTheDocument();
      expect(screen.getByText(/message/i)).toBeInTheDocument();
    });
  });

  test("hides borrow and message buttons in viewOnly mode", async () => {
    renderModal({ viewOnly: true });
    await waitFor(() => {
      expect(screen.queryByRole("button", { name: /^borrow$/i })).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: /message/i })).not.toBeInTheDocument();
    });
  });

  test("shows report button for non-owner user", async () => {
    renderModal();
    await waitFor(() => {
      expect(screen.getByText(/report this item/i)).toBeInTheDocument();
    });
  });

  test("hides report button when user is the owner", async () => {
    renderModal({ user: mockOwnerUser });
    await waitFor(() => {
      expect(screen.queryByText(/report this item/i)).not.toBeInTheDocument();
    });
  });

  test("opens ReportModal when report button is clicked", async () => {
    renderModal();
    await waitFor(() => {
      expect(screen.getByText(/report this item/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(/report this item/i));
    expect(screen.getByTestId("report-modal")).toBeInTheDocument();
  });

  test("shows description", async () => {
    renderModal();
    await waitFor(() => {
      expect(screen.getByText("Professional camera for rent")).toBeInTheDocument();
    });
  });

  test("shows no images available when no images", async () => {
    renderModal();
    await waitFor(() => {
      expect(screen.getByText("No images available")).toBeInTheDocument();
    });
  });

  test("shows already requested state when user has pending request", async () => {
    global.fetch = jest.fn((url) => {
      if (url.includes("/api/requests/item/")) {
        return Promise.resolve({
          ok: true,
          json: async () => [
            { borrowerId: 1, status: "PENDING" },
          ],
        });
      }
      return Promise.resolve({ ok: true, json: async () => [] });
    });

    renderModal();
    await waitFor(() => {
      expect(screen.getByText(/already requested/i)).toBeInTheDocument();
    });
  });
});
