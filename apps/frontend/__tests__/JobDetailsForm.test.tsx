// apps/frontend/__tests__/JobDetailsForm.test.tsx
import { render, screen, fireEvent } from "@testing-library/react";
import JobDetailsForm, {
  type JobDetails,
} from "../src/components/JobDetailsForm";
import * as svc from "../src/services/contactService";

// fetchSkillOptions Mock
jest.spyOn(svc, "fetchSkillOptions").mockResolvedValue(["React", "TypeScript"]);

describe("JobDetailsForm", () => {
  const base: JobDetails = {
    jobName: "Bewerbung",
    jobUrl: "",
    applyDate: "2025-08-20",
  };

  test("renders and updates values", async () => {
    const onChange = jest.fn();
    render(<JobDetailsForm value={base} onChange={onChange} />);

    const nameInput = screen.getByPlaceholderText(/Bewerbung/i);
    fireEvent.change(nameInput, { target: { value: "Senior Dev" } });

    expect(onChange).toHaveBeenCalled();
  });
});
