import * as React from "react";
import styled, { withTheme } from "styled-components";
import { CardDragItem, DragItemTypes } from "../types/DragItemTypes";
import { useDrop } from "react-dnd";
import { XCircle } from "react-feather";
import { LinksContext } from "../contexts/Links";
import { LinkAction } from "../contexts/Links/reducer";

const StyledCell = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StyledXCircle = styled(XCircle)`
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
  margin: 2px;
  cursor: pointer;
`;

type CellProps = {
  index: number;
  gridIndex: number;
  isInEditMode: boolean;
  theme;
  children: React.ReactChild;
};

function Cell({ index, gridIndex, isInEditMode, theme, children }: CellProps) {
  const { dispatch } = React.useContext(LinksContext);

  const [{ isOver }, drop] = useDrop(
    () => ({
      accept: DragItemTypes.CARD,
      hover: (item: CardDragItem) =>
        dispatch({
          type: LinkAction.UPDATE_LINK_ORDER,
          payload: {
            sourceId: item.id,
            newLinkIndex: index,
            newGridIndex: gridIndex,
          },
        }),
      collect: (monitor) => ({
        isOver: !!monitor.isOver(),
      }),
    }),
    [index, gridIndex, dispatch]
  );

  return (
    <>
      {children && isInEditMode ? (
        <StyledXCircle
          size={24}
          color={theme.colors.delete}
          onClick={() =>
            dispatch({
              type: LinkAction.DELETE_LINK,
              payload: {
                cellIndex: index,
                gridIndex,
              },
            })
          }
        />
      ) : null}
      <StyledCell ref={drop}>{isOver ? null : children}</StyledCell>
    </>
  );
}

export default withTheme(Cell);
