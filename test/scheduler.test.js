import test from "node:test";
import assert from "node:assert/strict";
import {
  nextOrderId,
  scheduleOrders,
  summarizeOrders,
} from "../src/scheduler.js";

const orders = [
  {
    id: "A",
    cluster: "East",
    freshness: "standard",
    quantityLb: 100,
    createdAt: "2026-01-01T09:00:00.000Z",
  },
  {
    id: "B",
    cluster: "North",
    freshness: "soon",
    quantityLb: 240,
    createdAt: "2026-01-01T08:00:00.000Z",
  },
  {
    id: "C",
    cluster: "East",
    freshness: "urgent",
    quantityLb: 80,
    createdAt: "2026-01-01T10:00:00.000Z",
  },
  {
    id: "D",
    cluster: "East",
    freshness: "urgent",
    quantityLb: 60,
    createdAt: "2026-01-01T07:00:00.000Z",
  },
];

test("groups orders into geographic dispatches", () => {
  const plan = scheduleOrders(orders);
  assert.equal(plan.length, 2);
  assert.deepEqual(
    plan.map((dispatch) => dispatch.cluster),
    ["East", "North"],
  );
});

test("prioritizes dispatches containing the freshest constraints", () => {
  const plan = scheduleOrders(orders);
  assert.equal(plan[0].cluster, "East");
  assert.equal(plan[0].highestPriority, 0);
});

test("orders each cluster by freshness before intake time", () => {
  const east = scheduleOrders(orders).find(
    (dispatch) => dispatch.cluster === "East",
  );
  assert.deepEqual(
    east.orders.map((order) => order.id),
    ["D", "C", "A"],
  );
});

test("calculates dispatch weight and order count", () => {
  const east = scheduleOrders(orders).find(
    (dispatch) => dispatch.cluster === "East",
  );
  assert.equal(east.totalWeight, 240);
  assert.equal(east.orderCount, 3);
});

test("assigns a stable route-planning sequence", () => {
  const plan = scheduleOrders(orders);
  assert.deepEqual(
    plan.map((dispatch) => dispatch.sequence),
    [1, 2],
  );
});

test("summarizes queue volume without changing the orders", () => {
  const summary = summarizeOrders(orders);
  assert.deepEqual(summary, { orders: 4, weight: 480, clusters: 2 });
  assert.equal(orders.length, 4);
});

test("handles an empty weekly queue", () => {
  assert.deepEqual(scheduleOrders([]), []);
  assert.deepEqual(summarizeOrders([]), {
    orders: 0,
    weight: 0,
    clusters: 0,
  });
});

test("generates a unique order id after queue deletions", () => {
  const remainingOrders = [{ id: "CF-101" }, { id: "CF-104" }];
  assert.equal(nextOrderId(remainingOrders), "CF-105");
});
