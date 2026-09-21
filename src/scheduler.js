export const FRESHNESS_LEVELS = {
  urgent: { label: "Harvest-day priority", rank: 0 },
  soon: { label: "Freshness priority", rank: 1 },
  standard: { label: "Standard", rank: 2 },
};

export const DEMO_CLUSTERS = ["North", "Central", "East", "South"];

function compareOrders(left, right) {
  const freshnessDifference =
    FRESHNESS_LEVELS[left.freshness].rank -
    FRESHNESS_LEVELS[right.freshness].rank;

  if (freshnessDifference !== 0) return freshnessDifference;
  return new Date(left.createdAt) - new Date(right.createdAt);
}

export function scheduleOrders(orders) {
  const grouped = new Map();

  for (const order of orders) {
    if (!grouped.has(order.cluster)) grouped.set(order.cluster, []);
    grouped.get(order.cluster).push(order);
  }

  return Array.from(grouped.entries())
    .map(([cluster, clusterOrders]) => {
      const sortedOrders = [...clusterOrders].sort(compareOrders);
      const highestPriority = Math.min(
        ...sortedOrders.map(
          (order) => FRESHNESS_LEVELS[order.freshness].rank,
        ),
      );

      return {
        cluster,
        orders: sortedOrders,
        orderCount: sortedOrders.length,
        totalWeight: sortedOrders.reduce(
          (total, order) => total + Number(order.quantityLb),
          0,
        ),
        highestPriority,
      };
    })
    .sort((left, right) => {
      if (left.highestPriority !== right.highestPriority) {
        return left.highestPriority - right.highestPriority;
      }
      return left.cluster.localeCompare(right.cluster);
    })
    .map((dispatch, index) => ({
      ...dispatch,
      sequence: index + 1,
    }));
}

export function summarizeOrders(orders) {
  return {
    orders: orders.length,
    weight: orders.reduce(
      (total, order) => total + Number(order.quantityLb),
      0,
    ),
    clusters: new Set(orders.map((order) => order.cluster)).size,
  };
}

export function nextOrderId(orders) {
  const highestId = orders.reduce((highest, order) => {
    const numericId = Number.parseInt(String(order.id).replace("CF-", ""), 10);
    return Number.isNaN(numericId) ? highest : Math.max(highest, numericId);
  }, 100);

  return `CF-${highestId + 1}`;
}
