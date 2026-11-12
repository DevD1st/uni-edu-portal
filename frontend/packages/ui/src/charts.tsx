"use client";

import { useId, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DataTable } from "./content";
import { IconButton } from "./controls";
import { useClientReady } from "./use-client-ready";
import {
  chartKeyTarget,
  chartMaximum,
  chartTicks,
  formatChartValue,
  trendSegments,
  validChartValue,
  type ChartDatum,
  type ChartValueFormat,
} from "./chart-data";

export type { ChartDatum, ChartValueFormat } from "./chart-data";

export type ChartProps = {
  title: string;
  description?: string;
  data: readonly ChartDatum[];
  valueLabel: string;
  valueFormat?: ChartValueFormat;
  /** Optional count-axis maximum; actual values can never be clipped by it. Grades use 0–5. */
  maximum?: number;
  emptyMessage?: string;
  categoryLabel?: string;
};

function useChartSelection(
  data: readonly ChartDatum[],
  format: ChartValueFormat,
  preferLast: boolean,
) {
  const ready = useClientReady();
  const [selectedId, select] = useState<string | null>(null);
  const available = data.filter(
    (point) => validChartValue(point.value, format) !== null,
  );
  const selected =
    available.find(({ id }) => id === selectedId) ??
    (preferLast ? available.at(-1) : available[0]) ??
    null;
  const selectedIndex = available.findIndex(({ id }) => id === selected?.id);
  return { ready, selected, selectedIndex, available, select };
}

function SelectedValue({
  point,
  valueLabel,
  format,
  id,
}: {
  point: ChartDatum;
  valueLabel: string;
  format: ChartValueFormat;
  id: string;
}) {
  const href =
    point.href?.startsWith("/") && !point.href.startsWith("//") ? point.href : null;
  return (
    <div className="u-chart-selection" role="status" aria-atomic="true" id={id}>
      <div className="u-chart-selection-copy">
        <span>{point.label}</span>
        {point.detail && <p>{point.detail}</p>}
        {href && (
          <a className="u-text-link" href={href}>
            {point.hrefLabel ?? "Open record"}
          </a>
        )}
      </div>
      <div className="u-chart-selection-value">
        <strong>{formatChartValue(point.value, format)}</strong>
        <span>{valueLabel}</span>
      </div>
    </div>
  );
}

function ChartValues({
  title,
  data,
  valueLabel,
  valueFormat = "count",
  categoryLabel = "Category",
}: ChartProps) {
  if (!data.length) return null;
  return (
    <details className="u-chart-data">
      <summary>View data table</summary>
      <DataTable
        caption={title + " data"}
        columns={[{ label: categoryLabel }, { label: valueLabel, numeric: true }]}
      >
        {data.map((point) => (
          <tr key={point.id}>
            <th scope="row">
              {point.label}
              {point.detail && (
                <span className="u-chart-data-detail">{point.detail}</span>
              )}
            </th>
            <td data-numeric>{formatChartValue(point.value, valueFormat)}</td>
          </tr>
        ))}
      </DataTable>
    </details>
  );
}

const width = 640;
const height = 192;
const inset = 16;
const pointX = (index: number, count: number) =>
  count <= 1 ? width / 2 : inset + (index / (count - 1)) * (width - inset * 2);
const pointY = (value: number, maximum: number) =>
  inset + (1 - value / maximum) * (height - inset * 2);

export function TrendChart(props: ChartProps) {
  const {
    title,
    description,
    data,
    valueLabel,
    valueFormat = "count",
    maximum,
    emptyMessage = "No recorded values are available yet.",
  } = props;
  const id = useId();
  const model = useChartSelection(data, valueFormat, true);
  const upper = chartMaximum(data, valueFormat, maximum);
  const ticks = chartTicks(upper, valueFormat);
  const segments = trendSegments(data, valueFormat);
  const selectedIndex = data.findIndex(({ id }) => id === model.selected?.id);
  const selectedValue = model.selected?.value ?? 0;
  const first = data[0];
  const last = data.at(-1);

  function move(event: KeyboardEvent<HTMLButtonElement>) {
    const target = chartKeyTarget(
      event.key,
      model.selectedIndex,
      model.available.length,
    );
    const point = target === null ? undefined : model.available[target];
    if (!point) return;
    event.preventDefault();
    model.select(point.id);
  }

  function inspect(event: PointerEvent<HTMLButtonElement>) {
    if (!model.ready || !model.available.length) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    if (bounds.width <= 0) return;
    const x = ((event.clientX - bounds.left) / bounds.width) * width;
    const closest = model.available.reduce((previous, point) => {
      const distance = (candidate: ChartDatum) =>
        Math.abs(pointX(data.indexOf(candidate), data.length) - x);
      return distance(point) < distance(previous) ? point : previous;
    });
    model.select(closest.id);
  }

  return (
    <figure className="u-chart" aria-labelledby={id + "-title"}>
      <figcaption className="u-chart-heading">
        <h3 id={id + "-title"}>{title}</h3>
        {description && <p>{description}</p>}
      </figcaption>
      {model.selected ? (
        <>
          <div className="u-chart-scale">
            <span>{valueLabel}</span>
            <span>{valueFormat === "grade" ? "Scale 0–5" : "Baseline 0"}</span>
          </div>
          <div className="u-chart-trend">
            <div className="u-chart-y-labels" aria-hidden="true">
              {ticks.map((tick) => (
                <span
                  key={tick}
                  style={{ top: (pointY(tick, upper) / height) * 100 + "%" }}
                >
                  {valueFormat === "grade"
                    ? tick.toFixed(2)
                    : tick.toLocaleString("en")}
                </span>
              ))}
            </div>
            <div className="u-chart-trend-main">
              <button
                type="button"
                className="u-chart-plot"
                aria-label={"Explore " + title}
                aria-describedby={id + "-hint " + id + "-selection"}
                aria-keyshortcuts="ArrowLeft ArrowRight Home End"
                disabled={!model.ready}
                onKeyDown={move}
                onPointerDown={inspect}
                onPointerMove={(event) => {
                  if (event.pointerType !== "touch") inspect(event);
                }}
              >
                <svg
                  viewBox={`0 0 ${width} ${height}`}
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <defs>
                    <linearGradient id={id + "-fill"} x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="0%"
                        stopColor="var(--uemp-accent)"
                        stopOpacity="0.16"
                      />
                      <stop
                        offset="100%"
                        stopColor="var(--uemp-accent)"
                        stopOpacity="0.01"
                      />
                    </linearGradient>
                  </defs>
                  {ticks.map((tick) => (
                    <line
                      key={tick}
                      className="u-chart-grid"
                      x1="0"
                      x2={width}
                      y1={pointY(tick, upper)}
                      y2={pointY(tick, upper)}
                    />
                  ))}
                  {segments
                    .filter((segment) => segment.length > 1)
                    .map((segment) => {
                      const points = segment
                        .map(
                          (point) =>
                            `${pointX(point.index, data.length)},${pointY(point.value, upper)}`,
                        )
                        .join(" ");
                      const beginning = segment[0];
                      const ending = segment.at(-1);
                      return beginning && ending ? (
                        <g key={beginning.index}>
                          <polygon
                            points={`${pointX(beginning.index, data.length)},${pointY(0, upper)} ${points} ${pointX(ending.index, data.length)},${pointY(0, upper)}`}
                            fill={`url(#${id}-fill)`}
                          />
                          <polyline points={points} className="u-chart-line" />
                        </g>
                      ) : null;
                    })}
                  <line
                    className="u-chart-guide"
                    x1={pointX(selectedIndex, data.length)}
                    x2={pointX(selectedIndex, data.length)}
                    y1={inset}
                    y2={pointY(0, upper)}
                  />
                </svg>
                {data.map((point, index) => {
                  const value = validChartValue(point.value, valueFormat);
                  return value === null ? null : (
                    <span
                      key={point.id}
                      className="u-chart-dot"
                      aria-hidden="true"
                      style={{
                        left: (pointX(index, data.length) / width) * 100 + "%",
                        top: (pointY(value, upper) / height) * 100 + "%",
                      }}
                    />
                  );
                })}
                <span
                  className="u-chart-dot"
                  data-active="true"
                  aria-hidden="true"
                  style={{
                    left: (pointX(selectedIndex, data.length) / width) * 100 + "%",
                    top: (pointY(selectedValue, upper) / height) * 100 + "%",
                  }}
                />
              </button>
              <div
                className="u-chart-x-labels"
                data-single={data.length === 1 || undefined}
                aria-hidden="true"
              >
                <span>{first?.shortLabel ?? first?.label}</span>
                {data.length > 1 && <span>{last?.shortLabel ?? last?.label}</span>}
              </div>
            </div>
          </div>
          <div className="u-chart-exploration">
            <p id={id + "-hint"}>
              {!model.ready
                ? "Chart controls are loading. Values are available in the data table."
                : model.available.length === 1
                  ? "One recorded period. More periods are needed to show a trend."
                  : "Tap the chart or use arrow keys to explore each period."}
            </p>
            <div className="u-chart-step-buttons">
              <IconButton
                label="Previous point"
                disabled={!model.ready || model.selectedIndex <= 0}
                onClick={() =>
                  model.select(model.available[model.selectedIndex - 1]?.id ?? null)
                }
              >
                <ChevronLeft size={18} aria-hidden="true" />
              </IconButton>
              <IconButton
                label="Next point"
                disabled={
                  !model.ready || model.selectedIndex >= model.available.length - 1
                }
                onClick={() =>
                  model.select(model.available[model.selectedIndex + 1]?.id ?? null)
                }
              >
                <ChevronRight size={18} aria-hidden="true" />
              </IconButton>
            </div>
          </div>
          <SelectedValue
            point={model.selected}
            valueLabel={valueLabel}
            format={valueFormat}
            id={id + "-selection"}
          />
        </>
      ) : (
        <p className="u-chart-empty">{emptyMessage}</p>
      )}
      <ChartValues {...props} categoryLabel={props.categoryLabel ?? "Period"} />
    </figure>
  );
}

export function BarChart(props: ChartProps) {
  const {
    title,
    description,
    data,
    valueLabel,
    valueFormat = "count",
    maximum,
    emptyMessage = "No recorded values are available yet.",
  } = props;
  const id = useId();
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const model = useChartSelection(data, valueFormat, false);
  const upper = chartMaximum(data, valueFormat, maximum);

  function move(event: KeyboardEvent<HTMLButtonElement>, point: ChartDatum) {
    const current = model.available.findIndex(({ id }) => id === point.id);
    const target = chartKeyTarget(event.key, current, model.available.length);
    const selected = target === null ? undefined : model.available[target];
    if (!selected) return;
    event.preventDefault();
    model.select(selected.id);
    buttons.current[data.indexOf(selected)]?.focus();
  }

  return (
    <figure className="u-chart" aria-labelledby={id + "-title"}>
      <figcaption className="u-chart-heading">
        <h3 id={id + "-title"}>{title}</h3>
        {description && <p>{description}</p>}
      </figcaption>
      {model.selected ? (
        <>
          <p className="u-chart-bar-hint" id={id + "-hint"}>
            {model.ready
              ? "Select a bar to inspect its value. Arrow keys move between bars."
              : "Chart controls are loading. Values are available in the data table."}
          </p>
          <div className="u-chart-bars">
            {data.map((point, index) => {
              const value = validChartValue(point.value, valueFormat);
              const selected = point.id === model.selected?.id;
              return (
                <button
                  key={point.id}
                  type="button"
                  className="u-chart-bar"
                  ref={(element) => {
                    buttons.current[index] = element;
                  }}
                  disabled={!model.ready || value === null}
                  aria-pressed={selected}
                  aria-describedby={id + "-hint"}
                  onFocus={() => model.select(point.id)}
                  onClick={() => model.select(point.id)}
                  onKeyDown={(event) => move(event, point)}
                >
                  <span className="u-chart-bar-heading">
                    <span>{point.label}</span>{" "}
                    <strong>
                      {formatChartValue(point.value, valueFormat)}
                      <span className="u-chart-value-label"> {valueLabel}</span>
                    </strong>
                  </span>
                  <svg
                    className="u-chart-bar-track"
                    viewBox="0 0 640 12"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                  >
                    <rect className="u-chart-track" width="640" height="12" rx="6" />
                    <rect
                      className="u-chart-bar-fill"
                      width={((value ?? 0) / upper) * width}
                      height="12"
                      rx="6"
                    />
                    {value === 0 && (
                      <line className="u-chart-zero" x1="1" x2="1" y1="0" y2="12" />
                    )}
                  </svg>
                </button>
              );
            })}
          </div>
          <div className="u-chart-bar-scale" aria-hidden="true">
            <span>0</span>
            <span>
              {valueLabel} ·{" "}
              {valueFormat === "grade" ? upper.toFixed(2) : upper.toLocaleString("en")}
            </span>
          </div>
          <SelectedValue
            point={model.selected}
            valueLabel={valueLabel}
            format={valueFormat}
            id={id + "-selection"}
          />
        </>
      ) : (
        <p className="u-chart-empty">{emptyMessage}</p>
      )}
      <ChartValues {...props} />
    </figure>
  );
}
