// apps/frontend/__tests__/SkillsMultiSelect.test.tsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SkillsMultiSelect from "../src/components/SkillsMultiSelect";

describe("SkillsMultiSelect", () => {
  test("shows suggestions and allows adding new item", async () => {
    const fetchOptions = jest.fn().mockResolvedValue(["React", "TypeScript"]);
    const onChange = jest.fn();

    render(
      <SkillsMultiSelect
        value={["React"]}
        onChange={onChange}
        fetchOptions={fetchOptions}
        label="Skills"
      />
    );

    // lädt Vorschläge
    await waitFor(() => expect(fetchOptions).toHaveBeenCalled());

    // tippen
    const input = screen.getByPlaceholderText(/Tippe, um zu suchen/i);
    fireEvent.change(input, { target: { value: "Node" } });

    // "Neu hinzufügen" selecten
    const addNew = await screen.findByText(/Neu hinzufügen/i);
    fireEvent.mouseDown(addNew);
    fireEvent.click(addNew);

    expect(onChange).toHaveBeenCalledWith(["React", "Node"]);
  });
});
