import { render, screen } from "@testing-library/react";
import { List } from "./List";
import { noop } from "../../utils";
import userEvent from "@testing-library/user-event";

describe(List.name, () => {
  it.each([
    {
      scenario: "an empty array",
      images: [],
    },
    {
      scenario: "an array with one item",
      images: [{ name: "name", url: "url" }],
    },
    {
      scenario: "an array with five items",
      images: [
        { name: "name1", url: "url1" },
        { name: "name2", url: "url2" },
        { name: "name3", url: "url3" },
        { name: "name4", url: "url4" },
        { name: "name5", url: "url5" },
      ],
    },
  ])(
    "should have an item by each image when images is {scenario}",
    ({ images }) => {
      // Act
      render(
        <List
          images={images}
          checkedImages={new Set()}
          toggleCheckedImage={noop}
        />
      );

      // Assert
      const list = screen.getByTestId("image-list");
      expect(list.childElementCount).toBe(images.length);
    }
  );

  it("should show the checked items", () => {
    // Arrange
    const uncheckedIndex1 = 0;
    const checkedIndex1 = 1;
    const uncheckedIndex2 = 2;
    const checkedIndex2 = 3;
    const uncheckedIndex3 = 4;

    const images = [
      { name: "name1", url: "url1" },
      { name: "name2", url: "url2" },
      { name: "name3", url: "url3" },
      { name: "name4", url: "url4" },
      { name: "name5", url: "url5" },
    ];

    const checkedItems = new Set([
      images[checkedIndex1],
      images[checkedIndex2],
    ]);

    // Act
    render(
      <List
        images={images}
        checkedImages={checkedItems}
        toggleCheckedImage={noop}
      />
    );

    // Assert
    const list = screen.getByTestId("image-list");
    expect(hasACheckedCheckbox(list.children[checkedIndex1])).toBe(true);
    expect(hasACheckedCheckbox(list.children[checkedIndex2])).toBe(true);
    expect(hasACheckedCheckbox(list.children[uncheckedIndex1])).toBe(false);
    expect(hasACheckedCheckbox(list.children[uncheckedIndex2])).toBe(false);
    expect(hasACheckedCheckbox(list.children[uncheckedIndex3])).toBe(false);
  });

  it("should pass the clicked item to toggleCheckedImage", async () => {
    // Arrange
    const images = [
      { name: "name1", url: "url1" },
      { name: "name2", url: "url2" },
      { name: "name3", url: "url3" },
      { name: "name4", url: "url4" },
      { name: "name5", url: "url5" },
    ];
    const testItemIndex = 3;
    const testItem = images[3];
    const toggleCheckedImage = jest.fn();

    // Act
    render(
      <List
        images={images}
        checkedImages={new Set()}
        toggleCheckedImage={toggleCheckedImage}
      />
    );

    // Assert
    const list = screen.getByTestId("image-list");
    const testLi = list.children[testItemIndex];
    const testCheckbox = testLi.querySelector('input[type="checkbox"]');

    await userEvent.click(testCheckbox!);
    expect(toggleCheckedImage).toBeCalledWith(testItem);
  });
});

function hasACheckedCheckbox(element: Element) {
  const checkbox = element.querySelector('input[type="checkbox"]');
  return !!(checkbox && "checked" in checkbox && checkbox.checked);
}