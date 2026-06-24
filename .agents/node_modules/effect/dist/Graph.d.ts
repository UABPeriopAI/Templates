/**
 * @since 4.0.0
 */
import * as Data from "./Data.ts";
import * as Equal from "./Equal.ts";
import type { Inspectable } from "./Inspectable.ts";
import * as Option from "./Option.ts";
import type { Pipeable } from "./Pipeable.ts";
declare const TypeId = "~effect/collections/Graph";
/**
 * Node index for node identification using plain numbers.
 *
 * @since 4.0.0
 * @category models
 */
export type NodeIndex = number;
/**
 * Edge index for edge identification using plain numbers.
 *
 * @since 4.0.0
 * @category models
 */
export type EdgeIndex = number;
/**
 * Edge data containing source, target, and user data.
 *
 * @since 4.0.0
 * @category models
 */
export declare class Edge<E> extends Data.Class<{
    readonly source: NodeIndex;
    readonly target: NodeIndex;
    readonly data: E;
}> {
}
/**
 * Graph type for distinguishing directed and undirected graphs.
 *
 * @since 4.0.0
 * @category models
 */
export type Kind = "directed" | "undirected";
/**
 * Graph prototype interface.
 *
 * @since 4.0.0
 * @category models
 */
export interface Proto<out N, out E> extends Iterable<readonly [NodeIndex, N]>, Equal.Equal, Pipeable, Inspectable {
    readonly [TypeId]: typeof TypeId;
    readonly nodes: Map<NodeIndex, N>;
    readonly edges: Map<EdgeIndex, Edge<E>>;
    readonly adjacency: Map<NodeIndex, Array<EdgeIndex>>;
    readonly reverseAdjacency: Map<NodeIndex, Array<EdgeIndex>>;
    nextNodeIndex: NodeIndex;
    nextEdgeIndex: EdgeIndex;
    acyclic: Option.Option<boolean>;
}
/**
 * Immutable graph interface.
 *
 * @since 4.0.0
 * @category models
 */
export interface Graph<out N, out E, T extends Kind = "directed"> extends Proto<N, E> {
    readonly type: T;
    readonly mutable: false;
}
/**
 * Mutable graph interface.
 *
 * @since 4.0.0
 * @category models
 */
export interface MutableGraph<out N, out E, T extends Kind = "directed"> extends Proto<N, E> {
    readonly type: T;
    readonly mutable: true;
}
/**
 * Directed graph type alias.
 *
 * @since 4.0.0
 * @category models
 */
export type DirectedGraph<N, E> = Graph<N, E, "directed">;
/**
 * Undirected graph type alias.
 *
 * @since 4.0.0
 * @category models
 */
export type UndirectedGraph<N, E> = Graph<N, E, "undirected">;
/**
 * Mutable directed graph type alias.
 *
 * @since 4.0.0
 * @category models
 */
export type MutableDirectedGraph<N, E> = MutableGraph<N, E, "directed">;
/**
 * Mutable undirected graph type alias.
 *
 * @since 4.0.0
 * @category models
 */
export type MutableUndirectedGraph<N, E> = MutableGraph<N, E, "undirected">;
declare const GraphError_base: new <A extends Record<string, any> = {}>(args: import("./Types.ts").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("./Cause.ts").YieldableError & {
    readonly _tag: "GraphError";
} & Readonly<A>;
/**
 * @since 4.0.0
 * @category errors
 */
export declare class GraphError extends GraphError_base<{
    readonly message: string;
}> {
}
/**
 * @since 4.0.0
 * @category Guards
 */
export declare const isGraph: (u: unknown) => u is Graph<unknown, unknown>;
/**
 * Creates a directed graph, optionally with initial mutations.
 *
 * @example
 * ```ts
 * import { Graph } from "effect"
 *
 * // Directed graph with initial nodes and edges
 * const graph = Graph.directed<string, string>((mutable) => {
 *   const a = Graph.addNode(mutable, "A")
 *   const b = Graph.addNode(mutable, "B")
 *   const c = Graph.addNode(mutable, "C")
 *   Graph.addEdge(mutable, a, b, "A->B")
 *   Graph.addEdge(mutable, b, c, "B->C")
 * })
 * ```
 *
 * @since 4.0.0
 * @category constructors
 */
export declare const directed: <N, E>(mutate?: (mutable: MutableDirectedGraph<N, E>) => void) => DirectedGraph<N, E>;
/**
 * Creates an undirected graph, optionally with initial mutations.
 *
 * @example
 * ```ts
 * import { Graph } from "effect"
 *
 * // Undirected graph with initial nodes and edges
 * const graph = Graph.undirected<string, string>((mutable) => {
 *   const a = Graph.addNode(mutable, "A")
 *   const b = Graph.addNode(mutable, "B")
 *   const c = Graph.addNode(mutable, "C")
 *   Graph.addEdge(mutable, a, b, "A-B")
 *   Graph.addEdge(mutable, b, c, "B-C")
 * })
 * ```
 *
 * @since 4.0.0
 * @category constructors
 */
export declare const undirected: <N, E>(mutate?: (mutable: MutableUndirectedGraph<N, E>) => void) => UndirectedGraph<N, E>;
/**
 * Creates a mutable scope for safe graph mutations by copying the data structure.
 *
 * @example
 * ```ts
 * import { Graph } from "effect"
 *
 * const graph = Graph.directed<string, number>()
 * const mutable = Graph.beginMutation(graph)
 * // Now mutable can be safely modified without affecting original graph
 * ```
 *
 * @since 4.0.0
 * @category mutations
 */
export declare const beginMutation: <N, E, T extends Kind = "directed">(graph: Graph<N, E, T>) => MutableGraph<N, E, T>;
/**
 * Converts a mutable graph back to an immutable graph, ending the mutation scope.
 *
 * @example
 * ```ts
 * import { Graph } from "effect"
 *
 * const graph = Graph.directed<string, number>()
 * const mutable = Graph.beginMutation(graph)
 * // ... perform mutations on mutable ...
 * const newGraph = Graph.endMutation(mutable)
 * ```
 *
 * @since 4.0.0
 * @category mutations
 */
export declare const endMutation: <N, E, T extends Kind = "directed">(mutable: MutableGraph<N, E, T>) => Graph<N, E, T>;
/**
 * Performs scoped mutations on a graph, automatically managing the mutation lifecycle.
 *
 * @example
 * ```ts
 * import { Graph } from "effect"
 *
 * const graph = Graph.directed<string, number>()
 * const newGraph = Graph.mutate(graph, (mutable) => {
 *   // Safe mutations go here
 *   // mutable gets automatically converted back to immutable
 * })
 * ```
 *
 * @since 4.0.0
 * @category mutations
 */
export declare const mutate: {
    /**
     * Performs scoped mutations on a graph, automatically managing the mutation lifecycle.
     *
     * @example
     * ```ts
     * import { Graph } from "effect"
     *
     * const graph = Graph.directed<string, number>()
     * const newGraph = Graph.mutate(graph, (mutable) => {
     *   // Safe mutations go here
     *   // mutable gets automatically converted back to immutable
     * })
     * ```
     *
     * @since 4.0.0
     * @category mutations
     */
    <N, E, T extends Kind = "directed">(f: (mutable: MutableGraph<N, E, T>) => void): (graph: Graph<N, E, T>) => Graph<N, E, T>;
    /**
     * Performs scoped mutations on a graph, automatically managing the mutation lifecycle.
     *
     * @example
     * ```ts
     * import { Graph } from "effect"
     *
     * const graph = Graph.directed<string, number>()
     * const newGraph = Graph.mutate(graph, (mutable) => {
     *   // Safe mutations go here
     *   // mutable gets automatically converted back to immutable
     * })
     * ```
     *
     * @since 4.0.0
     * @category mutations
     */
    <N, E, T extends Kind = "directed">(graph: Graph<N, E, T>, f: (mutable: MutableGraph<N, E, T>) => void): Graph<N, E, T>;
};
/**
 * Adds a new node to a mutable graph and returns its index.
 *
 * @example
 * ```ts
 * import { Graph } from "effect"
 *
 * const result = Graph.mutate(Graph.directed<string, number>(), (mutable) => {
 *   const nodeA = Graph.addNode(mutable, "Node A")
 *   const nodeB = Graph.addNode(mutable, "Node B")
 *   console.log(nodeA) // NodeIndex with value 0
 *   console.log(nodeB) // NodeIndex with value 1
 * })
 * ```
 *
 * @since 4.0.0
 * @category mutations
 */
export declare const addNode: <N, E, T extends Kind = "directed">(mutable: MutableGraph<N, E, T>, data: N) => NodeIndex;
/**
 * Gets the data associated with a node index, if it exists.
 *
 * @example
 * ```ts
 * import { Graph } from "effect"
 * import * as Option from "effect/Option"
 *
 * const graph = Graph.mutate(Graph.directed<string, number>(), (mutable) => {
 *   Graph.addNode(mutable, "Node A")
 * })
 *
 * const nodeIndex = 0
 * const nodeData = Graph.getNode(graph, nodeIndex)
 *
 * if (Option.isSome(nodeData)) {
 *   console.log(nodeData.value) // "Node A"
 * }
 * ```
 *
 * @since 4.0.0
 * @category getters
 */
export declare const getNode: {
    /**
     * Gets the data associated with a node index, if it exists.
     *
     * @example
     * ```ts
     * import { Graph } from "effect"
     * import * as Option from "effect/Option"
     *
     * const graph = Graph.mutate(Graph.directed<string, number>(), (mutable) => {
     *   Graph.addNode(mutable, "Node A")
     * })
     *
     * const nodeIndex = 0
     * const nodeData = Graph.getNode(graph, nodeIndex)
     *
     * if (Option.isSome(nodeData)) {
     *   console.log(nodeData.value) // "Node A"
     * }
     * ```
     *
     * @since 4.0.0
     * @category getters
     */
    <N, E, T extends Kind = "directed">(nodeIndex: NodeIndex): (graph: Graph<N, E, T> | MutableGraph<N, E, T>) => Option.Option<N>;
    /**
     * Gets the data associated with a node index, if it exists.
     *
     * @example
     * ```ts
     * import { Graph } from "effect"
     * import * as Option from "effect/Option"
     *
     * const graph = Graph.mutate(Graph.directed<string, number>(), (mutable) => {
     *   Graph.addNode(mutable, "Node A")
     * })
     *
     * const nodeIndex = 0
     * const nodeData = Graph.getNode(graph, nodeIndex)
     *
     * if (Option.isSome(nodeData)) {
     *   console.log(nodeData.value) // "Node A"
     * }
     * ```
     *
     * @since 4.0.0
     * @category getters
     */
    <N, E, T extends Kind = "directed">(graph: Graph<N, E, T> | MutableGraph<N, E, T>, nodeIndex: NodeIndex): Option.Option<N>;
};
/**
 * Checks if a node with the given index exists in the graph.
 *
 * @example
 * ```ts
 * import { Graph } from "effect"
 *
 * const graph = Graph.mutate(Graph.directed<string, number>(), (mutable) => {
 *   Graph.addNode(mutable, "Node A")
 * })
 *
 * const nodeIndex = 0
 * const exists = Graph.hasNode(graph, nodeIndex)
 * console.log(exists) // true
 *
 * const nonExistentIndex = 999
 * const notExists = Graph.hasNode(graph, nonExistentIndex)
 * console.log(notExists) // false
 * ```
 *
 * @since 4.0.0
 * @category getters
 */
export declare const hasNode: {
    /**
     * Checks if a node with the given index exists in the graph.
     *
     * @example
     * ```ts
     * import { Graph } from "effect"
     *
     * const graph = Graph.mutate(Graph.directed<string, number>(), (mutable) => {
     *   Graph.addNode(mutable, "Node A")
     * })
     *
     * const nodeIndex = 0
     * const exists = Graph.hasNode(graph, nodeIndex)
     * console.log(exists) // true
     *
     * const nonExistentIndex = 999
     * const notExists = Graph.hasNode(graph, nonExistentIndex)
     * console.log(notExists) // false
     * ```
     *
     * @since 4.0.0
     * @category getters
     */
    (nodeIndex: NodeIndex): <N, E, T extends Kind = "directed">(graph: Graph<N, E, T> | MutableGraph<N, E, T>) => boolean;
    /**
     * Checks if a node with the given index exists in the graph.
     *
     * @example
     * ```ts
     * import { Graph } from "effect"
     *
     * const graph = Graph.mutate(Graph.directed<string, number>(), (mutable) => {
     *   Graph.addNode(mutable, "Node A")
     * })
     *
     * const nodeIndex = 0
     * const exists = Graph.hasNode(graph, nodeIndex)
     * console.log(exists) // true
     *
     * const nonExistentIndex = 999
     * const notExists = Graph.hasNode(graph, nonExistentIndex)
     * console.log(notExists) // false
     * ```
     *
     * @since 4.0.0
     * @category getters
     */
    <N, E, T extends Kind = "directed">(graph: Graph<N, E, T> | MutableGraph<N, E, T>, nodeIndex: NodeIndex): boolean;
};
/**
 * Returns the number of nodes in the graph.
 *
 * @example
 * ```ts
 * import { Graph } from "effect"
 *
 * const emptyGraph = Graph.directed<string, number>()
 * console.log(Graph.nodeCount(emptyGraph)) // 0
 *
 * const graphWithNodes = Graph.mutate(emptyGraph, (mutable) => {
 *   Graph.addNode(mutable, "Node A")
 *   Graph.addNode(mutable, "Node B")
 *   Graph.addNode(mutable, "Node C")
 * })
 *
 * console.log(Graph.nodeCount(graphWithNodes)) // 3
 * ```
 *
 * @since 4.0.0
 * @category getters
 */
export declare const nodeCount: <N, E, T extends Kind = "directed">(graph: Graph<N, E, T> | MutableGraph<N, E, T>) => number;
/**
 * Finds the first node that matches the given predicate.
 *
 * @example
 * ```ts
 * import { Graph } from "effect"
 *
 * const graph = Graph.mutate(Graph.directed<string, number>(), (mutable) => {
 *   Graph.addNode(mutable, "Node A")
 *   Graph.addNode(mutable, "Node B")
 *   Graph.addNode(mutable, "Node C")
 * })
 *
 * const result = Graph.findNode(graph, (data) => data.startsWith("Node B"))
 * console.log(result) // Option.some(1)
 *
 * const notFound = Graph.findNode(graph, (data) => data === "Node D")
 * console.log(notFound) // Option.none()
 * ```
 *
 * @since 4.0.0
 * @category getters
 */
export declare const findNode: {
    /**
     * Finds the first node that matches the given predicate.
     *
     * @example
     * ```ts
     * import { Graph } from "effect"
     *
     * const graph = Graph.mutate(Graph.directed<string, number>(), (mutable) => {
     *   Graph.addNode(mutable, "Node A")
     *   Graph.addNode(mutable, "Node B")
     *   Graph.addNode(mutable, "Node C")
     * })
     *
     * const result = Graph.findNode(graph, (data) => data.startsWith("Node B"))
     * console.log(result) // Option.some(1)
     *
     * const notFound = Graph.findNode(graph, (data) => data === "Node D")
     * console.log(notFound) // Option.none()
     * ```
     *
     * @since 4.0.0
     * @category getters
     */
    <N>(predicate: (data: N) => boolean): <E, T extends Kind = "directed">(graph: Graph<N, E, T> | MutableGraph<N, E, T>) => Option.Option<NodeIndex>;
    /**
     * Finds the first node that matches the given predicate.
     *
     * @example
     * ```ts
     * import { Graph } from "effect"
     *
     * const graph = Graph.mutate(Graph.directed<string, number>(), (mutable) => {
     *   Graph.addNode(mutable, "Node A")
     *   Graph.addNode(mutable, "Node B")
     *   Graph.addNode(mutable, "Node C")
     * })
     *
     * const result = Graph.findNode(graph, (data) => data.startsWith("Node B"))
     * console.log(result) // Option.some(1)
     *
     * const notFound = Graph.findNode(graph, (data) => data === "Node D")
     * console.log(notFound) // Option.none()
     * ```
     *
     * @since 4.0.0
     * @category getters
     */
    <N, E, T extends Kind = "directed">(graph: Graph<N, E, T> | MutableGraph<N, E, T>, predicate: (data: N) => boolean): Option.Option<NodeIndex>;
};
/**
 * Finds all nodes that match the given predicate.
 *
 * @example
 * ```ts
 * import { Graph } from "effect"
 *
 * const graph = Graph.mutate(Graph.directed<string, number>(), (mutable) => {
 *   Graph.addNode(mutable, "Start A")
 *   Graph.addNode(mutable, "Node B")
 *   Graph.addNode(mutable, "Start C")
 * })
 *
 * const result = Graph.findNodes(graph, (data) => data.startsWith("Start"))
 * console.log(result) // [0, 2]
 *
 * const empty = Graph.findNodes(graph, (data) => data === "Not Found")
 * console.log(empty) // []
 * ```
 *
 * @since 4.0.0
 * @category getters
 */
export declare const findNodes: {
    /**
     * Finds all nodes that match the given predicate.
     *
     * @example
     * ```ts
     * import { Graph } from "effect"
     *
     * const graph = Graph.mutate(Graph.directed<string, number>(), (mutable) => {
     *   Graph.addNode(mutable, "Start A")
     *   Graph.addNode(mutable, "Node B")
     *   Graph.addNode(mutable, "Start C")
     * })
     *
     * const result = Graph.findNodes(graph, (data) => data.startsWith("Start"))
     * console.log(result) // [0, 2]
     *
     * const empty = Graph.findNodes(graph, (data) => data === "Not Found")
     * console.log(empty) // []
     * ```
     *
     * @since 4.0.0
     * @category getters
     */
    <N>(predicate: (data: N) => boolean): <E, T extends Kind = "directed">(graph: Graph<N, E, T> | MutableGraph<N, E, T>) => Array<NodeIndex>;
    /**
     * Finds all nodes that match the given predicate.
     *
     * @example
     * ```ts
     * import { Graph } from "effect"
     *
     * const graph = Graph.mutate(Graph.directed<string, number>(), (mutable) => {
     *   Graph.addNode(mutable, "Start A")
     *   Graph.addNode(mutable, "Node B")
     *   Graph.addNode(mutable, "Start C")
     * })
     *
     * const result = Graph.findNodes(graph, (data) => data.startsWith("Start"))
     * console.log(result) // [0, 2]
     *
     * const empty = Graph.findNodes(graph, (data) => data === "Not Found")
     * console.log(empty) // []
     * ```
     *
     * @since 4.0.0
     * @category getters
     */
    <N, E, T extends Kind = "directed">(graph: Graph<N, E, T> | MutableGraph<N, E, T>, predicate: (data: N) => boolean): Array<NodeIndex>;
};
/**
 * Finds the first edge that matches the given predicate.
 *
 * @example
 * ```ts
 * import { Graph } from "effect"
 *
 * const graph = Graph.mutate(Graph.directed<string, number>(), (mutable) => {
 *   const nodeA = Graph.addNode(mutable, "Node A")
 *   const nodeB = Graph.addNode(mutable, "Node B")
 *   const nodeC = Graph.addNode(mutable, "Node C")
 *   Graph.addEdge(mutable, nodeA, nodeB, 10)
 *   Graph.addEdge(mutable, nodeB, nodeC, 20)
 * })
 *
 * const result = Graph.findEdge(graph, (data) => data > 15)
 * console.log(result) // Option.some(1)
 *
 * const notFound = Graph.findEdge(graph, (data) => data > 100)
 * console.log(notFound) // Option.none()
 * ```
 *
 * @since 4.0.0
 * @category getters
 */
export declare const findEdge: {
    /**
     * Finds the first edge that matches the given predicate.
     *
     * @example
     * ```ts
     * import { Graph } from "effect"
     *
     * const graph = Graph.mutate(Graph.directed<string, number>(), (mutable) => {
     *   const nodeA = Graph.addNode(mutable, "Node A")
     *   const nodeB = Graph.addNode(mutable, "Node B")
     *   const nodeC = Graph.addNode(mutable, "Node C")
     *   Graph.addEdge(mutable, nodeA, nodeB, 10)
     *   Graph.addEdge(mutable, nodeB, nodeC, 20)
     * })
     *
     * const result = Graph.findEdge(graph, (data) => data > 15)
     * console.log(result) // Option.some(1)
     *
     * const notFound = Graph.findEdge(graph, (data) => data > 100)
     * console.log(notFound) // Option.none()
     * ```
     *
     * @since 4.0.0
     * @category getters
     */
    <E>(predicate: (data: E, source: NodeIndex, target: NodeIndex) => boolean): <N, T extends Kind = "directed">(graph: Graph<N, E, T> | MutableGraph<N, E, T>) => Option.Option<EdgeIndex>;
    /**
     * Finds the first edge that matches the given predicate.
     *
     * @example
     * ```ts
     * import { Graph } from "effect"
     *
     * const graph = Graph.mutate(Graph.directed<string, number>(), (mutable) => {
     *   const nodeA = Graph.addNode(mutable, "Node A")
     *   const nodeB = Graph.addNode(mutable, "Node B")
     *   const nodeC = Graph.addNode(mutable, "Node C")
     *   Graph.addEdge(mutable, nodeA, nodeB, 10)
     *   Graph.addEdge(mutable, nodeB, nodeC, 20)
     * })
     *
     * const result = Graph.findEdge(graph, (data) => data > 15)
     * console.log(result) // Option.some(1)
     *
     * const notFound = Graph.findEdge(graph, (data) => data > 100)
     * console.log(notFound) // Option.none()
     * ```
     *
     * @since 4.0.0
     * @category getters
     */
    <N, E, T extends Kind = "directed">(graph: Graph<N, E, T> | MutableGraph<N, E, T>, predicate: (data: E, source: NodeIndex, target: NodeIndex) => boolean): Option.Option<EdgeIndex>;
};
/**
 * Finds all edges that match the given predicate.
 *
 * @example
 * ```ts
 * import { Graph } from "effect"
 *
 * const graph = Graph.mutate(Graph.directed<string, number>(), (mutable) => {
 *   const nodeA = Graph.addNode(mutable, "Node A")
 *   const nodeB = Graph.addNode(mutable, "Node B")
 *   const nodeC = Graph.addNode(mutable, "Node C")
 *   Graph.addEdge(mutable, nodeA, nodeB, 10)
 *   Graph.addEdge(mutable, nodeB, nodeC, 20)
 *   Graph.addEdge(mutable, nodeC, nodeA, 30)
 * })
 *
 * const result = Graph.findEdges(graph, (data) => data >= 20)
 * console.log(result) // [1, 2]
 *
 * const empty = Graph.findEdges(graph, (data) => data > 100)
 * console.log(empty) // []
 * ```
 *
 * @since 4.0.0
 * @category getters
 */
export declare const findEdges: {
    /**
     * Finds all edges that match the given predicate.
     *
     * @example
     * ```ts
     * import { Graph } from "effect"
     *
     * const graph = Graph.mutate(Graph.directed<string, number>(), (mutable) => {
     *   const nodeA = Graph.addNode(mutable, "Node A")
     *   const nodeB = Graph.addNode(mutable, "Node B")
     *   const nodeC = Graph.addNode(mutable, "Node C")
     *   Graph.addEdge(mutable, nodeA, nodeB, 10)
     *   Graph.addEdge(mutable, nodeB, nodeC, 20)
     *   Graph.addEdge(mutable, nodeC, nodeA, 30)
     * })
     *
     * const result = Graph.findEdges(graph, (data) => data >= 20)
     * console.log(result) // [1, 2]
     *
     * const empty = Graph.findEdges(graph, (data) => data > 100)
     * console.log(empty) // []
     * ```
     *
     * @since 4.0.0
     * @category getters
     */
    <E>(predicate: (data: E, source: NodeIndex, target: NodeIndex) => boolean): <N, T extends Kind = "directed">(graph: Graph<N, E, T> | MutableGraph<N, E, T>) => Array<EdgeIndex>;
    /**
     * Finds all edges that match the given predicate.
     *
     * @example
     * ```ts
     * import { Graph } from "effect"
     *
     * const graph = Graph.mutate(Graph.directed<string, number>(), (mutable) => {
     *   const nodeA = Graph.addNode(mutable, "Node A")
     *   const nodeB = Graph.addNode(mutable, "Node B")
     *   const nodeC = Graph.addNode(mutable, "Node C")
     *   Graph.addEdge(mutable, nodeA, nodeB, 10)
     *   Graph.addEdge(mutable, nodeB, nodeC, 20)
     *   Graph.addEdge(mutable, nodeC, nodeA, 30)
     * })
     *
     * const result = Graph.findEdges(graph, (data) => data >= 20)
     * console.log(result) // [1, 2]
     *
     * const empty = Graph.findEdges(graph, (data) => data > 100)
     * console.log(empty) // []
     * ```
     *
     * @since 4.0.0
     * @category getters
     */
    <N, E, T extends Kind = "directed">(graph: Graph<N, E, T> | MutableGraph<N, E, T>, predicate: (data: E, source: NodeIndex, target: NodeIndex) => boolean): Array<EdgeIndex>;
};
/**
 * Updates a single node's data by applying a transformation function.
 *
 * @example
 * ```ts
 * import { Graph } from "effect"
 *
 * const graph = Graph.directed<string, number>((mutable) => {
 *   Graph.addNode(mutable, "Node A")
 *   Graph.addNode(mutable, "Node B")
 *   Graph.updateNode(mutable, 0, (data) => data.toUpperCase())
 * })
 *
 * const nodeData = Graph.getNode(graph, 0)
 * console.log(nodeData) // Option.some("NODE A")
 * ```
 *
 * @since 4.0.0
 * @category transformations
 */
export declare const updateNode: <N, E, T extends Kind = "directed">(mutable: MutableGraph<N, E, T>, index: NodeIndex, f: (data: N) => N) => void;
/**
 * Updates a single edge's data by applying a transformation function.
 *
 * @example
 * ```ts
 * import { Graph } from "effect"
 *
 * const result = Graph.mutate(Graph.directed<string, number>(), (mutable) => {
 *   const nodeA = Graph.addNode(mutable, "Node A")
 *   const nodeB = Graph.addNode(mutable, "Node B")
 *   const edgeIndex = Graph.addEdge(mutable, nodeA, nodeB, 10)
 *   Graph.updateEdge(mutable, edgeIndex, (data) => data * 2)
 * })
 *
 * const edgeData = Graph.getEdge(result, 0)
 * console.log(edgeData) // new Graph.Edge({ source: 0, target: 1, data: 20 })
 * ```
 *
 * @since 4.0.0
 * @category mutations
 */
export declare const updateEdge: <N, E, T extends Kind = "directed">(mutable: MutableGraph<N, E, T>, edgeIndex: EdgeIndex, f: (data: E) => E) => void;
/**
 * Creates a new graph with transformed node data using the provided mapping function.
 *
 * @example
 * ```ts
 * import { Graph } from "effect"
 *
 * const graph = Graph.directed<string, number>((mutable) => {
 *   Graph.addNode(mutable, "node a")
 *   Graph.addNode(mutable, "node b")
 *   Graph.addNode(mutable, "node c")
 *   Graph.mapNodes(mutable, (data) => data.toUpperCase())
 * })
 *
 * const nodeData = Graph.getNode(graph, 0)
 * console.log(nodeData) // new Graph.Node("NODE A")
 * ```
 *
 * @since 4.0.0
 * @category transformations
 */
export declare const mapNodes: <N, E, T extends Kind = "directed">(mutable: MutableGraph<N, E, T>, f: (data: N) => N) => void;
/**
 * Transforms all edge data in a mutable graph using the provided mapping function.
 *
 * @example
 * ```ts
 * import { Graph } from "effect"
 *
 * const graph = Graph.directed<string, number>((mutable) => {
 *   const a = Graph.addNode(mutable, "A")
 *   const b = Graph.addNode(mutable, "B")
 *   const c = Graph.addNode(mutable, "C")
 *   Graph.addEdge(mutable, a, b, 10)
 *   Graph.addEdge(mutable, b, c, 20)
 *   Graph.mapEdges(mutable, (data) => data * 2)
 * })
 *
 * const edgeData = Graph.getEdge(graph, 0)
 * console.log(edgeData) // new Graph.Edge({ source: 0, target: 1, data: 20 })
 * ```
 *
 * @since 4.0.0
 * @category transformations
 */
export declare const mapEdges: <N, E, T extends Kind = "directed">(mutable: MutableGraph<N, E, T>, f: (data: E) => E) => void;
/**
 * Reverses all edge directions in a mutable graph by swapping source and target nodes.
 *
 * @example
 * ```ts
 * import { Graph } from "effect"
 *
 * const graph = Graph.directed<string, number>((mutable) => {
 *   const a = Graph.addNode(mutable, "A")
 *   const b = Graph.addNode(mutable, "B")
 *   const c = Graph.addNode(mutable, "C")
 *   Graph.addEdge(mutable, a, b, 1) // A -> B
 *   Graph.addEdge(mutable, b, c, 2) // B -> C
 *   Graph.reverse(mutable) // Now B -> A, C -> B
 * })
 *
 * const edge0 = Graph.getEdge(graph, 0)
 * console.log(edge0) // new Graph.Edge({ source: 1, target: 0, data: 1 }) - B -> A
 * ```
 *
 * @since 4.0.0
 * @category transformations
 */
export declare const reverse: <N, E, T extends Kind = "directed">(mutable: MutableGraph<N, E, T>) => void;
/**
 * Filters and optionally transforms nodes in a mutable graph using a predicate function.
 * Nodes that return Option.none are removed along with all their connected edges.
 *
 * @example
 * ```ts
 * import { Graph } from "effect"
 * import * as Option from "effect/Option"
 *
 * const graph = Graph.directed<string, number>((mutable) => {
 *   const a = Graph.addNode(mutable, "active")
 *   const b = Graph.addNode(mutable, "inactive")
 *   const c = Graph.addNode(mutable, "active")
 *   Graph.addEdge(mutable, a, b, 1)
 *   Graph.addEdge(mutable, b, c, 2)
 *
 *   // Keep only "active" nodes and transform to uppercase
 *   Graph.filterMapNodes(
 *     mutable,
 *     (data) =>
 *       data === "active" ? Option.some(data.toUpperCase()) : Option.none()
 *   )
 * })
 *
 * console.log(Graph.nodeCount(graph)) // 2 (only "active" nodes remain)
 * ```
 *
 * @since 4.0.0
 * @category transformations
 */
export declare const filterMapNodes: <N, E, T extends Kind = "directed">(mutable: MutableGraph<N, E, T>, f: (data: N) => Option.Option<N>) => void;
/**
 * Filters and optionally transforms edges in a mutable graph using a predicate function.
 * Edges that return Option.none are removed from the graph.
 *
 * @example
 * ```ts
 * import { Graph } from "effect"
 * import * as Option from "effect/Option"
 *
 * const graph = Graph.directed<string, number>((mutable) => {
 *   const a = Graph.addNode(mutable, "A")
 *   const b = Graph.addNode(mutable, "B")
 *   const c = Graph.addNode(mutable, "C")
 *   Graph.addEdge(mutable, a, b, 5)
 *   Graph.addEdge(mutable, b, c, 15)
 *   Graph.addEdge(mutable, c, a, 25)
 *
 *   // Keep only edges with weight >= 10 and double their weight
 *   Graph.filterMapEdges(
 *     mutable,
 *     (data) => data >= 10 ? Option.some(data * 2) : Option.none()
 *   )
 * })
 *
 * console.log(Graph.edgeCount(graph)) // 2 (edges with weight 5 removed)
 * ```
 *
 * @since 4.0.0
 * @category transformations
 */
export declare const filterMapEdges: <N, E, T extends Kind = "directed">(mutable: MutableGraph<N, E, T>, f: (data: E) => Option.Option<E>) => void;
/**
 * Filters nodes by removing those that don't match the predicate.
 * This function modifies the mutable graph in place.
 *
 * @example
 * ```ts
 * import { Graph } from "effect"
 *
 * const graph = Graph.directed<string, number>((mutable) => {
 *   Graph.addNode(mutable, "active")
 *   Graph.addNode(mutable, "inactive")
 *   Graph.addNode(mutable, "pending")
 *   Graph.addNode(mutable, "active")
 *
 *   // Keep only "active" nodes
 *   Graph.filterNodes(mutable, (data) => data === "active")
 * })
 *
 * console.log(Graph.nodeCount(graph)) // 2 (only "active" nodes remain)
 * ```
 *
 * @since 4.0.0
 * @category transformations
 */
export declare const filterNodes: <N, E, T extends Kind = "directed">(mutable: MutableGraph<N, E, T>, predicate: (data: N) => boolean) => void;
/**
 * Filters edges by removing those that don't match the predicate.
 * This function modifies the mutable graph in place.
 *
 * @example
 * ```ts
 * import { Graph } from "effect"
 *
 * const graph = Graph.directed<string, number>((mutable) => {
 *   const a = Graph.addNode(mutable, "A")
 *   const b = Graph.addNode(mutable, "B")
 *   const c = Graph.addNode(mutable, "C")
 *
 *   Graph.addEdge(mutable, a, b, 5)
 *   Graph.addEdge(mutable, b, c, 15)
 *   Graph.addEdge(mutable, c, a, 25)
 *
 *   // Keep only edges with weight >= 10
 *   Graph.filterEdges(mutable, (data) => data >= 10)
 * })
 *
 * console.log(Graph.edgeCount(graph)) // 2 (edge with weight 5 removed)
 * ```
 *
 * @since 4.0.0
 * @category transformations
 */
export declare const filterEdges: <N, E, T extends Kind = "directed">(mutable: MutableGraph<N, E, T>, predicate: (data: E) => boolean) => void;
/**
 * Adds a new edge to a mutable graph and returns its index.
 *
 * @example
 * ```ts
 * import { Graph } from "effect"
 *
 * const result = Graph.mutate(Graph.directed<string, number>(), (mutable) => {
 *   const nodeA = Graph.addNode(mutable, "Node A")
 *   const nodeB = Graph.addNode(mutable, "Node B")
 *   const edge = Graph.addEdge(mutable, nodeA, nodeB, 42)
 *   console.log(edge) // EdgeIndex with value 0
 * })
 * ```
 *
 * @since 4.0.0
 * @category mutations
 */
export declare const addEdge: <N, E, T extends Kind = "directed">(mutable: MutableGraph<N, E, T>, source: NodeIndex, target: NodeIndex, data: E) => EdgeIndex;
/**
 * Removes a node and all its incident edges from a mutable graph.
 *
 * @example
 * ```ts
 * import { Graph } from "effect"
 *
 * const result = Graph.mutate(Graph.directed<string, number>(), (mutable) => {
 *   const nodeA = Graph.addNode(mutable, "Node A")
 *   const nodeB = Graph.addNode(mutable, "Node B")
 *   Graph.addEdge(mutable, nodeA, nodeB, 42)
 *
 *   // Remove nodeA and all edges connected to it
 *   Graph.removeNode(mutable, nodeA)
 * })
 * ```
 *
 * @since 4.0.0
 * @category mutations
 */
export declare const removeNode: <N, E, T extends Kind = "directed">(mutable: MutableGraph<N, E, T>, nodeIndex: NodeIndex) => void;
/**
 * Removes an edge from a mutable graph.
 *
 * @example
 * ```ts
 * import { Graph } from "effect"
 *
 * const result = Graph.mutate(Graph.directed<string, number>(), (mutable) => {
 *   const nodeA = Graph.addNode(mutable, "Node A")
 *   const nodeB = Graph.addNode(mutable, "Node B")
 *   const edge = Graph.addEdge(mutable, nodeA, nodeB, 42)
 *
 *   // Remove the edge
 *   Graph.removeEdge(mutable, edge)
 * })
 * ```
 *
 * @since 4.0.0
 * @category mutations
 */
export declare const removeEdge: <N, E, T extends Kind = "directed">(mutable: MutableGraph<N, E, T>, edgeIndex: EdgeIndex) => void;
/**
 * Gets the edge data associated with an edge index, if it exists.
 *
 * @example
 * ```ts
 * import { Graph } from "effect"
 *
 * const graph = Graph.mutate(Graph.directed<string, number>(), (mutable) => {
 *   const nodeA = Graph.addNode(mutable, "Node A")
 *   const nodeB = Graph.addNode(mutable, "Node B")
 *   Graph.addEdge(mutable, nodeA, nodeB, 42)
 * })
 *
 * const edgeIndex = 0
 * const edgeData = Graph.getEdge(graph, edgeIndex)
 *
 * if (edgeData._tag === "Some") {
 *   console.log(edgeData.value.data) // 42
 *   console.log(edgeData.value.source) // NodeIndex(0)
 *   console.log(edgeData.value.target) // NodeIndex(1)
 * }
 * ```
 *
 * @since 4.0.0
 * @category getters
 */
export declare const getEdge: {
    /**
     * Gets the edge data associated with an edge index, if it exists.
     *
     * @example
     * ```ts
     * import { Graph } from "effect"
     *
     * const graph = Graph.mutate(Graph.directed<string, number>(), (mutable) => {
     *   const nodeA = Graph.addNode(mutable, "Node A")
     *   const nodeB = Graph.addNode(mutable, "Node B")
     *   Graph.addEdge(mutable, nodeA, nodeB, 42)
     * })
     *
     * const edgeIndex = 0
     * const edgeData = Graph.getEdge(graph, edgeIndex)
     *
     * if (edgeData._tag === "Some") {
     *   console.log(edgeData.value.data) // 42
     *   console.log(edgeData.value.source) // NodeIndex(0)
     *   console.log(edgeData.value.target) // NodeIndex(1)
     * }
     * ```
     *
     * @since 4.0.0
     * @category getters
     */
    <E>(edgeIndex: EdgeIndex): <N, T extends Kind = "directed">(graph: Graph<N, E, T> | MutableGraph<N, E, T>) => Option.Option<Edge<E>>;
    /**
     * Gets the edge data associated with an edge index, if it exists.
     *
     * @example
     * ```ts
     * import { Graph } from "effect"
     *
     * const graph = Graph.mutate(Graph.directed<string, number>(), (mutable) => {
     *   const nodeA = Graph.addNode(mutable, "Node A")
     *   const nodeB = Graph.addNode(mutable, "Node B")
     *   Graph.addEdge(mutable, nodeA, nodeB, 42)
     * })
     *
     * const edgeIndex = 0
     * const edgeData = Graph.getEdge(graph, edgeIndex)
     *
     * if (edgeData._tag === "Some") {
     *   console.log(edgeData.value.data) // 42
     *   console.log(edgeData.value.source) // NodeIndex(0)
     *   console.log(edgeData.value.target) // NodeIndex(1)
     * }
     * ```
     *
     * @since 4.0.0
     * @category getters
     */
    <N, E, T extends Kind = "directed">(graph: Graph<N, E, T> | MutableGraph<N, E, T>, edgeIndex: EdgeIndex): Option.Option<Edge<E>>;
};
/**
 * Checks if an edge exists between two nodes in the graph.
 *
 * @example
 * ```ts
 * import { Graph } from "effect"
 *
 * const graph = Graph.mutate(Graph.directed<string, number>(), (mutable) => {
 *   const nodeA = Graph.addNode(mutable, "Node A")
 *   const nodeB = Graph.addNode(mutable, "Node B")
 *   const nodeC = Graph.addNode(mutable, "Node C")
 *   Graph.addEdge(mutable, nodeA, nodeB, 42)
 * })
 *
 * const nodeA = 0
 * const nodeB = 1
 * const nodeC = 2
 *
 * const hasAB = Graph.hasEdge(graph, nodeA, nodeB)
 * console.log(hasAB) // true
 *
 * const hasAC = Graph.hasEdge(graph, nodeA, nodeC)
 * console.log(hasAC) // false
 * ```
 *
 * @since 4.0.0
 * @category getters
 */
export declare const hasEdge: {
    /**
     * Checks if an edge exists between two nodes in the graph.
     *
     * @example
     * ```ts
     * import { Graph } from "effect"
     *
     * const graph = Graph.mutate(Graph.directed<string, number>(), (mutable) => {
     *   const nodeA = Graph.addNode(mutable, "Node A")
     *   const nodeB = Graph.addNode(mutable, "Node B")
     *   const nodeC = Graph.addNode(mutable, "Node C")
     *   Graph.addEdge(mutable, nodeA, nodeB, 42)
     * })
     *
     * const nodeA = 0
     * const nodeB = 1
     * const nodeC = 2
     *
     * const hasAB = Graph.hasEdge(graph, nodeA, nodeB)
     * console.log(hasAB) // true
     *
     * const hasAC = Graph.hasEdge(graph, nodeA, nodeC)
     * console.log(hasAC) // false
     * ```
     *
     * @since 4.0.0
     * @category getters
     */
    (source: NodeIndex, target: NodeIndex): <N, E, T extends Kind = "directed">(graph: Graph<N, E, T> | MutableGraph<N, E, T>) => boolean;
    /**
     * Checks if an edge exists between two nodes in the graph.
     *
     * @example
     * ```ts
     * import { Graph } from "effect"
     *
     * const graph = Graph.mutate(Graph.directed<string, number>(), (mutable) => {
     *   const nodeA = Graph.addNode(mutable, "Node A")
     *   const nodeB = Graph.addNode(mutable, "Node B")
     *   const nodeC = Graph.addNode(mutable, "Node C")
     *   Graph.addEdge(mutable, nodeA, nodeB, 42)
     * })
     *
     * const nodeA = 0
     * const nodeB = 1
     * const nodeC = 2
     *
     * const hasAB = Graph.hasEdge(graph, nodeA, nodeB)
     * console.log(hasAB) // true
     *
     * const hasAC = Graph.hasEdge(graph, nodeA, nodeC)
     * console.log(hasAC) // false
     * ```
     *
     * @since 4.0.0
     * @category getters
     */
    <N, E, T extends Kind = "directed">(graph: Graph<N, E, T> | MutableGraph<N, E, T>, source: NodeIndex, target: NodeIndex): boolean;
};
/**
 * Returns the number of edges in the graph.
 *
 * @example
 * ```ts
 * import { Graph } from "effect"
 *
 * const emptyGraph = Graph.directed<string, number>()
 * console.log(Graph.edgeCount(emptyGraph)) // 0
 *
 * const graphWithEdges = Graph.mutate(emptyGraph, (mutable) => {
 *   const nodeA = Graph.addNode(mutable, "Node A")
 *   const nodeB = Graph.addNode(mutable, "Node B")
 *   const nodeC = Graph.addNode(mutable, "Node C")
 *   Graph.addEdge(mutable, nodeA, nodeB, 1)
 *   Graph.addEdge(mutable, nodeB, nodeC, 2)
 *   Graph.addEdge(mutable, nodeC, nodeA, 3)
 * })
 *
 * console.log(Graph.edgeCount(graphWithEdges)) // 3
 * ```
 *
 * @since 4.0.0
 * @category getters
 */
export declare const edgeCount: <N, E, T extends Kind = "directed">(graph: Graph<N, E, T> | MutableGraph<N, E, T>) => number;
/**
 * Returns the neighboring nodes (targets of outgoing edges) for a given node.
 *
 * @example
 * ```ts
 * import { Graph } from "effect"
 *
 * const graph = Graph.mutate(Graph.directed<string, number>(), (mutable) => {
 *   const nodeA = Graph.addNode(mutable, "Node A")
 *   const nodeB = Graph.addNode(mutable, "Node B")
 *   const nodeC = Graph.addNode(mutable, "Node C")
 *   Graph.addEdge(mutable, nodeA, nodeB, 1)
 *   Graph.addEdge(mutable, nodeA, nodeC, 2)
 * })
 *
 * const nodeA = 0
 * const nodeB = 1
 * const nodeC = 2
 *
 * const neighborsA = Graph.neighbors(graph, nodeA)
 * console.log(neighborsA) // [NodeIndex(1), NodeIndex(2)]
 *
 * const neighborsB = Graph.neighbors(graph, nodeB)
 * console.log(neighborsB) // []
 * ```
 *
 * @since 4.0.0
 * @category getters
 */
export declare const neighbors: {
    /**
     * Returns the neighboring nodes (targets of outgoing edges) for a given node.
     *
     * @example
     * ```ts
     * import { Graph } from "effect"
     *
     * const graph = Graph.mutate(Graph.directed<string, number>(), (mutable) => {
     *   const nodeA = Graph.addNode(mutable, "Node A")
     *   const nodeB = Graph.addNode(mutable, "Node B")
     *   const nodeC = Graph.addNode(mutable, "Node C")
     *   Graph.addEdge(mutable, nodeA, nodeB, 1)
     *   Graph.addEdge(mutable, nodeA, nodeC, 2)
     * })
     *
     * const nodeA = 0
     * const nodeB = 1
     * const nodeC = 2
     *
     * const neighborsA = Graph.neighbors(graph, nodeA)
     * console.log(neighborsA) // [NodeIndex(1), NodeIndex(2)]
     *
     * const neighborsB = Graph.neighbors(graph, nodeB)
     * console.log(neighborsB) // []
     * ```
     *
     * @since 4.0.0
     * @category getters
     */
    (nodeIndex: NodeIndex): <N, E, T extends Kind = "directed">(graph: Graph<N, E, T> | MutableGraph<N, E, T>) => Array<NodeIndex>;
    /**
     * Returns the neighboring nodes (targets of outgoing edges) for a given node.
     *
     * @example
     * ```ts
     * import { Graph } from "effect"
     *
     * const graph = Graph.mutate(Graph.directed<string, number>(), (mutable) => {
     *   const nodeA = Graph.addNode(mutable, "Node A")
     *   const nodeB = Graph.addNode(mutable, "Node B")
     *   const nodeC = Graph.addNode(mutable, "Node C")
     *   Graph.addEdge(mutable, nodeA, nodeB, 1)
     *   Graph.addEdge(mutable, nodeA, nodeC, 2)
     * })
     *
     * const nodeA = 0
     * const nodeB = 1
     * const nodeC = 2
     *
     * const neighborsA = Graph.neighbors(graph, nodeA)
     * console.log(neighborsA) // [NodeIndex(1), NodeIndex(2)]
     *
     * const neighborsB = Graph.neighbors(graph, nodeB)
     * console.log(neighborsB) // []
     * ```
     *
     * @since 4.0.0
     * @category getters
     */
    <N, E, T extends Kind = "directed">(graph: Graph<N, E, T> | MutableGraph<N, E, T>, nodeIndex: NodeIndex): Array<NodeIndex>;
};
/**
 * Get neighbors of a node in a specific direction for bidirectional traversal.
 *
 * @example
 * ```ts
 * import { Graph } from "effect"
 *
 * const graph = Graph.directed<string, string>((mutable) => {
 *   const a = Graph.addNode(mutable, "A")
 *   const b = Graph.addNode(mutable, "B")
 *   Graph.addEdge(mutable, a, b, "A->B")
 * })
 *
 * const nodeA = 0
 * const nodeB = 1
 *
 * // Get outgoing neighbors (nodes that nodeA points to)
 * const outgoing = Graph.neighborsDirected(graph, nodeA, "outgoing")
 *
 * // Get incoming neighbors (nodes that point to nodeB)
 * const incoming = Graph.neighborsDirected(graph, nodeB, "incoming")
 * ```
 *
 * @since 4.0.0
 * @category queries
 */
export declare const neighborsDirected: {
    /**
     * Get neighbors of a node in a specific direction for bidirectional traversal.
     *
     * @example
     * ```ts
     * import { Graph } from "effect"
     *
     * const graph = Graph.directed<string, string>((mutable) => {
     *   const a = Graph.addNode(mutable, "A")
     *   const b = Graph.addNode(mutable, "B")
     *   Graph.addEdge(mutable, a, b, "A->B")
     * })
     *
     * const nodeA = 0
     * const nodeB = 1
     *
     * // Get outgoing neighbors (nodes that nodeA points to)
     * const outgoing = Graph.neighborsDirected(graph, nodeA, "outgoing")
     *
     * // Get incoming neighbors (nodes that point to nodeB)
     * const incoming = Graph.neighborsDirected(graph, nodeB, "incoming")
     * ```
     *
     * @since 4.0.0
     * @category queries
     */
    (nodeIndex: NodeIndex, direction: Direction): <N, E, T extends Kind = "directed">(graph: Graph<N, E, T> | MutableGraph<N, E, T>) => Array<NodeIndex>;
    /**
     * Get neighbors of a node in a specific direction for bidirectional traversal.
     *
     * @example
     * ```ts
     * import { Graph } from "effect"
     *
     * const graph = Graph.directed<string, string>((mutable) => {
     *   const a = Graph.addNode(mutable, "A")
     *   const b = Graph.addNode(mutable, "B")
     *   Graph.addEdge(mutable, a, b, "A->B")
     * })
     *
     * const nodeA = 0
     * const nodeB = 1
     *
     * // Get outgoing neighbors (nodes that nodeA points to)
     * const outgoing = Graph.neighborsDirected(graph, nodeA, "outgoing")
     *
     * // Get incoming neighbors (nodes that point to nodeB)
     * const incoming = Graph.neighborsDirected(graph, nodeB, "incoming")
     * ```
     *
     * @since 4.0.0
     * @category queries
     */
    <N, E, T extends Kind = "directed">(graph: Graph<N, E, T> | MutableGraph<N, E, T>, nodeIndex: NodeIndex, direction: Direction): Array<NodeIndex>;
};
/**
 * Configuration options for GraphViz DOT format generation from graphs.
 *
 * Provides customization for node labels, edge labels, and graph naming
 * in DOT format compatible with GraphViz tools.
 *
 * @example
 * ```ts
 * import type * as Graph from "effect/Graph"
 *
 * // Basic options with custom labels
 * const basicOptions: Graph.GraphVizOptions<string, number> = {
 *   nodeLabel: (data) => `Node: ${data}`,
 *   edgeLabel: (data) => `Weight: ${data}`
 * }
 *
 * // Complete options with graph naming
 * const namedOptions: Graph.GraphVizOptions<string, string> = {
 *   nodeLabel: (data) => data.toUpperCase(),
 *   edgeLabel: (data) => data,
 *   graphName: "MyDependencyGraph"
 * }
 * ```
 *
 * @since 4.0.0
 * @category models
 */
export interface GraphVizOptions<N, E> {
    /**
     * Function to generate custom labels for nodes.
     * Defaults to String(data) if not provided.
     */
    readonly nodeLabel?: (data: N) => string;
    /**
     * Function to generate custom labels for edges.
     * Defaults to String(data) if not provided.
     */
    readonly edgeLabel?: (data: E) => string;
    /**
     * Name for the DOT graph.
     * Defaults to "G" if not provided.
     */
    readonly graphName?: string;
}
/**
 * Exports a graph to GraphViz DOT format for visualization.
 *
 * @example
 * ```ts
 * import { Graph } from "effect"
 *
 * const graph = Graph.mutate(Graph.directed<string, number>(), (mutable) => {
 *   const nodeA = Graph.addNode(mutable, "Node A")
 *   const nodeB = Graph.addNode(mutable, "Node B")
 *   const nodeC = Graph.addNode(mutable, "Node C")
 *   Graph.addEdge(mutable, nodeA, nodeB, 1)
 *   Graph.addEdge(mutable, nodeB, nodeC, 2)
 *   Graph.addEdge(mutable, nodeC, nodeA, 3)
 * })
 *
 * const dot = Graph.toGraphViz(graph)
 * console.log(dot)
 * // digraph G {
 * //   "0" [label="Node A"];
 * //   "1" [label="Node B"];
 * //   "2" [label="Node C"];
 * //   "0" -> "1" [label="1"];
 * //   "1" -> "2" [label="2"];
 * //   "2" -> "0" [label="3"];
 * // }
 * ```
 *
 * @since 4.0.0
 * @category utils
 */
export declare const toGraphViz: {
    /**
     * Exports a graph to GraphViz DOT format for visualization.
     *
     * @example
     * ```ts
     * import { Graph } from "effect"
     *
     * const graph = Graph.mutate(Graph.directed<string, number>(), (mutable) => {
     *   const nodeA = Graph.addNode(mutable, "Node A")
     *   const nodeB = Graph.addNode(mutable, "Node B")
     *   const nodeC = Graph.addNode(mutable, "Node C")
     *   Graph.addEdge(mutable, nodeA, nodeB, 1)
     *   Graph.addEdge(mutable, nodeB, nodeC, 2)
     *   Graph.addEdge(mutable, nodeC, nodeA, 3)
     * })
     *
     * const dot = Graph.toGraphViz(graph)
     * console.log(dot)
     * // digraph G {
     * //   "0" [label="Node A"];
     * //   "1" [label="Node B"];
     * //   "2" [label="Node C"];
     * //   "0" -> "1" [label="1"];
     * //   "1" -> "2" [label="2"];
     * //   "2" -> "0" [label="3"];
     * // }
     * ```
     *
     * @since 4.0.0
     * @category utils
     */
    <N, E>(options?: GraphVizOptions<N, E>): <T extends Kind = "directed">(graph: Graph<N, E, T> | MutableGraph<N, E, T>) => string;
    /**
     * Exports a graph to GraphViz DOT format for visualization.
     *
     * @example
     * ```ts
     * import { Graph } from "effect"
     *
     * const graph = Graph.mutate(Graph.directed<string, number>(), (mutable) => {
     *   const nodeA = Graph.addNode(mutable, "Node A")
     *   const nodeB = Graph.addNode(mutable, "Node B")
     *   const nodeC = Graph.addNode(mutable, "Node C")
     *   Graph.addEdge(mutable, nodeA, nodeB, 1)
     *   Graph.addEdge(mutable, nodeB, nodeC, 2)
     *   Graph.addEdge(mutable, nodeC, nodeA, 3)
     * })
     *
     * const dot = Graph.toGraphViz(graph)
     * console.log(dot)
     * // digraph G {
     * //   "0" [label="Node A"];
     * //   "1" [label="Node B"];
     * //   "2" [label="Node C"];
     * //   "0" -> "1" [label="1"];
     * //   "1" -> "2" [label="2"];
     * //   "2" -> "0" [label="3"];
     * // }
     * ```
     *
     * @since 4.0.0
     * @category utils
     */
    <N, E, T extends Kind = "directed">(graph: Graph<N, E, T> | MutableGraph<N, E, T>, options?: GraphVizOptions<N, E>): string;
};
/**
 * Mermaid node shape types for diagram visualization.
 *
 * Each shape produces different visual representations in Mermaid diagrams:
 * - `rectangle`: Standard rectangular nodes `A["label"]`
 * - `rounded`: Rounded rectangular nodes `A("label")`
 * - `circle`: Circular nodes `A(("label"))`
 * - `diamond`: Diamond-shaped nodes `A{"label"}`
 * - `hexagon`: Hexagonal nodes `A{{"label"}}`
 * - `stadium`: Stadium-shaped nodes `A(["label"])`
 * - `subroutine`: Subroutine-style nodes `A[["label"]]`
 * - `cylindrical`: Cylindrical database-style nodes `A[("label")]`
 *
 * @example
 * ```ts
 * import type * as Graph from "effect/Graph"
 *
 * // Shape selector function for different node types
 * const shapeSelector = (nodeData: string): Graph.MermaidNodeShape => {
 *   if (nodeData.includes("start") || nodeData.includes("end")) return "circle"
 *   if (nodeData.includes("decision")) return "diamond"
 *   if (nodeData.includes("process")) return "rectangle"
 *   if (nodeData.includes("data")) return "cylindrical"
 *   return "rounded"
 * }
 *
 * const options: Graph.MermaidOptions<string, string> = {
 *   nodeShape: shapeSelector
 * }
 * ```
 *
 * @since 4.0.0
 * @category models
 */
export type MermaidNodeShape = "rectangle" | "rounded" | "circle" | "diamond" | "hexagon" | "stadium" | "subroutine" | "cylindrical";
/**
 * Mermaid diagram direction types for controlling layout orientation.
 *
 * Determines the flow direction of nodes and edges in the diagram:
 * - `TB`/`TD`: Top to Bottom (vertical layout, default)
 * - `BT`: Bottom to Top (reverse vertical)
 * - `LR`: Left to Right (horizontal layout)
 * - `RL`: Right to Left (reverse horizontal)
 *
 * @example
 * ```ts
 * import type * as Graph from "effect/Graph"
 *
 * // Horizontal workflow diagram
 * const horizontalOptions: Graph.MermaidOptions<string, string> = {
 *   direction: "LR"
 * }
 *
 * // Vertical hierarchy (default)
 * const verticalOptions: Graph.MermaidOptions<string, string> = {
 *   direction: "TB"
 * }
 *
 * // Bottom-up flow
 * const bottomUpOptions: Graph.MermaidOptions<string, string> = {
 *   direction: "BT"
 * }
 * ```
 *
 * @since 4.0.0
 * @category models
 */
export type MermaidDirection = "TB" | "TD" | "BT" | "RL" | "LR";
/**
 * Mermaid diagram types for different visualization formats.
 *
 * Specifies the Mermaid diagram syntax to use:
 * - `flowchart`: For directed graphs with arrows (`A --> B`)
 * - `graph`: For undirected graphs with lines (`A --- B`)
 *
 * When not specified, automatically selects based on graph type:
 * directed graphs use "flowchart", undirected graphs use "graph".
 *
 * @example
 * ```ts
 * import type * as Graph from "effect/Graph"
 *
 * // Force flowchart format (even for undirected graphs)
 * const flowchartOptions: Graph.MermaidOptions<string, string> = {
 *   diagramType: "flowchart"
 * }
 *
 * // Force graph format (shows undirected connections)
 * const graphOptions: Graph.MermaidOptions<string, string> = {
 *   diagramType: "graph"
 * }
 *
 * // Auto-detection (recommended, default behavior)
 * const autoOptions: Graph.MermaidOptions<string, string> = {}
 * ```
 *
 * @since 4.0.0
 * @category models
 */
export type MermaidDiagramType = "flowchart" | "graph";
/**
 * Configuration options for Mermaid diagram generation, following GraphViz pattern.
 *
 * @since 4.0.0
 * @category models
 */
/**
 * Configuration options for Mermaid diagram generation from graphs.
 *
 * Provides customization for node labels, edge labels, diagram type,
 * layout direction, node shapes, and graph naming in Mermaid format.
 *
 * @example
 * ```ts
 * import type * as Graph from "effect/Graph"
 *
 * // Basic options with custom labels
 * const basicOptions: Graph.MermaidOptions<string, number> = {
 *   nodeLabel: (data) => `Node: ${data}`,
 *   edgeLabel: (data) => `Weight: ${data}`
 * }
 *
 * // Advanced options with all features
 * const advancedOptions: Graph.MermaidOptions<string, string> = {
 *   nodeLabel: (data) => data.toUpperCase(),
 *   edgeLabel: (data) => data,
 *   diagramType: "flowchart",
 *   direction: "LR",
 *   nodeShape: (data) => data.includes("start") ? "circle" : "rectangle"
 * }
 * ```
 *
 * @since 4.0.0
 * @category models
 */
export interface MermaidOptions<N, E> {
    /**
     * Function to generate custom labels for nodes.
     * Defaults to String(data) if not provided.
     */
    readonly nodeLabel?: (data: N) => string;
    /**
     * Function to generate custom labels for edges.
     * Defaults to String(data) if not provided.
     */
    readonly edgeLabel?: (data: E) => string;
    /**
     * Diagram type override. If not specified, automatically detects:
     * - "flowchart" for directed graphs
     * - "graph" for undirected graphs
     */
    readonly diagramType?: MermaidDiagramType;
    /**
     * Direction for diagram layout.
     * Defaults to "TD" (Top Down) if not provided.
     */
    readonly direction?: MermaidDirection;
    /**
     * Function to determine node shape for each node.
     * Defaults to "rectangle" for all nodes if not provided.
     */
    readonly nodeShape?: (data: N) => MermaidNodeShape;
}
/**
 * Exports a graph to Mermaid diagram format for visualization.
 *
 * Mermaid is a popular diagram-as-code tool that generates flowcharts and other
 * visualizations from text-based definitions. This function converts Effect Graph
 * structures to valid Mermaid syntax for use in documentation, web applications,
 * and visualization tools.
 *
 * @example
 * ```ts
 * import * as Graph from "effect/Graph"
 *
 * // Basic directed graph export
 * const graph = Graph.directed<string, number>((mutable) => {
 *   const app = Graph.addNode(mutable, "App")
 *   const db = Graph.addNode(mutable, "Database")
 *   const cache = Graph.addNode(mutable, "Cache")
 *   Graph.addEdge(mutable, app, db, 1)
 *   Graph.addEdge(mutable, app, cache, 2)
 * })
 *
 * const mermaid = Graph.toMermaid(graph)
 * console.log(mermaid)
 * // flowchart TD
 * //   0["App"]
 * //   1["Database"]
 * //   2["Cache"]
 * //   0 -->|"1"| 1
 * //   0 -->|"2"| 2
 * ```
 *
 * @example
 * ```ts
 * import * as Graph from "effect/Graph"
 *
 * // Undirected graph with custom labels and direction
 * const socialGraph = Graph.undirected<{ name: string }, string>((mutable) => {
 *   const alice = Graph.addNode(mutable, { name: "Alice" })
 *   const bob = Graph.addNode(mutable, { name: "Bob" })
 *   const charlie = Graph.addNode(mutable, { name: "Charlie" })
 *   Graph.addEdge(mutable, alice, bob, "friends")
 *   Graph.addEdge(mutable, bob, charlie, "colleagues")
 * })
 *
 * const mermaid = Graph.toMermaid(socialGraph, {
 *   nodeLabel: (person) => person.name,
 *   edgeLabel: (relationship) => relationship,
 *   direction: "LR"
 * })
 * console.log(mermaid)
 * // graph LR
 * //   0["Alice"]
 * //   1["Bob"]
 * //   2["Charlie"]
 * //   0 ---|"friends"| 1
 * //   1 ---|"colleagues"| 2
 * ```
 *
 * @example
 * ```ts
 * import * as Graph from "effect/Graph"
 *
 * // Advanced styling with node shapes for flowchart
 * const workflow = Graph.directed<{ type: string; name: string }, string>(
 *   (mutable) => {
 *     const start = Graph.addNode(mutable, { type: "start", name: "Begin" })
 *     const process = Graph.addNode(mutable, {
 *       type: "process",
 *       name: "Process Data"
 *     })
 *     const decision = Graph.addNode(mutable, {
 *       type: "decision",
 *       name: "Valid?"
 *     })
 *     const end = Graph.addNode(mutable, { type: "end", name: "Complete" })
 *     Graph.addEdge(mutable, start, process, "")
 *     Graph.addEdge(mutable, process, decision, "")
 *     Graph.addEdge(mutable, decision, end, "yes")
 *   }
 * )
 *
 * const mermaid = Graph.toMermaid(workflow, {
 *   nodeLabel: (node) => node.name,
 *   nodeShape: (node) => {
 *     switch (node.type) {
 *       case "start":
 *         return "stadium"
 *       case "process":
 *         return "rectangle"
 *       case "decision":
 *         return "diamond"
 *       case "end":
 *         return "stadium"
 *       default:
 *         return "rectangle"
 *     }
 *   }
 * })
 * console.log(mermaid)
 * // flowchart TD
 * //   0(["Begin"])
 * //   1["Process Data"]
 * //   2{"Valid?"}
 * //   3(["Complete"])
 * //   0 --> 1
 * //   1 --> 2
 * //   2 --> 3
 * ```
 *
 * @example
 * ```ts
 * import * as Graph from "effect/Graph"
 *
 * // Real-world example: Software dependency graph
 * interface Dependency {
 *   name: string
 *   version: string
 *   type: "library" | "framework" | "tool"
 * }
 *
 * const dependencyGraph = Graph.directed<Dependency, string>((mutable) => {
 *   const app = Graph.addNode(mutable, {
 *     name: "MyApp",
 *     version: "1.0.0",
 *     type: "library"
 *   })
 *   const react = Graph.addNode(mutable, {
 *     name: "React",
 *     version: "18.0.0",
 *     type: "framework"
 *   })
 *   const lodash = Graph.addNode(mutable, {
 *     name: "Lodash",
 *     version: "4.17.0",
 *     type: "library"
 *   })
 *   const webpack = Graph.addNode(mutable, {
 *     name: "Webpack",
 *     version: "5.0.0",
 *     type: "tool"
 *   })
 *
 *   Graph.addEdge(mutable, app, react, "depends on")
 *   Graph.addEdge(mutable, app, lodash, "depends on")
 *   Graph.addEdge(mutable, app, webpack, "builds with")
 * })
 *
 * const dependencyDiagram = Graph.toMermaid(dependencyGraph, {
 *   nodeLabel: (dep) => `${dep.name}\\nv${dep.version}`,
 *   edgeLabel: (edge) => edge,
 *   nodeShape: (dep) =>
 *     dep.type === "framework" ?
 *       "hexagon" :
 *       dep.type === "tool"
 *       ? "diamond"
 *       : "rectangle",
 *   direction: "TB"
 * })
 *
 * console.log(dependencyDiagram)
 * // flowchart TB
 * //   0["MyApp\nv1.0.0"]
 * //   1{{"React\nv18.0.0"}}
 * //   2["Lodash\nv4.17.0"]
 * //   3{"Webpack\nv5.0.0"}
 * //   0 -->|"depends on"| 1
 * //   0 -->|"depends on"| 2
 * //   0 -->|"builds with"| 3
 * ```
 *
 * @param graph - The graph to export (directed or undirected)
 * @param options - Optional configuration for the Mermaid output
 * @returns Mermaid diagram syntax as a string
 *
 * @since 4.0.0
 * @category utils
 */
export declare const toMermaid: {
    /**
     * Exports a graph to Mermaid diagram format for visualization.
     *
     * Mermaid is a popular diagram-as-code tool that generates flowcharts and other
     * visualizations from text-based definitions. This function converts Effect Graph
     * structures to valid Mermaid syntax for use in documentation, web applications,
     * and visualization tools.
     *
     * @example
     * ```ts
     * import * as Graph from "effect/Graph"
     *
     * // Basic directed graph export
     * const graph = Graph.directed<string, number>((mutable) => {
     *   const app = Graph.addNode(mutable, "App")
     *   const db = Graph.addNode(mutable, "Database")
     *   const cache = Graph.addNode(mutable, "Cache")
     *   Graph.addEdge(mutable, app, db, 1)
     *   Graph.addEdge(mutable, app, cache, 2)
     * })
     *
     * const mermaid = Graph.toMermaid(graph)
     * console.log(mermaid)
     * // flowchart TD
     * //   0["App"]
     * //   1["Database"]
     * //   2["Cache"]
     * //   0 -->|"1"| 1
     * //   0 -->|"2"| 2
     * ```
     *
     * @example
     * ```ts
     * import * as Graph from "effect/Graph"
     *
     * // Undirected graph with custom labels and direction
     * const socialGraph = Graph.undirected<{ name: string }, string>((mutable) => {
     *   const alice = Graph.addNode(mutable, { name: "Alice" })
     *   const bob = Graph.addNode(mutable, { name: "Bob" })
     *   const charlie = Graph.addNode(mutable, { name: "Charlie" })
     *   Graph.addEdge(mutable, alice, bob, "friends")
     *   Graph.addEdge(mutable, bob, charlie, "colleagues")
     * })
     *
     * const mermaid = Graph.toMermaid(socialGraph, {
     *   nodeLabel: (person) => person.name,
     *   edgeLabel: (relationship) => relationship,
     *   direction: "LR"
     * })
     * console.log(mermaid)
     * // graph LR
     * //   0["Alice"]
     * //   1["Bob"]
     * //   2["Charlie"]
     * //   0 ---|"friends"| 1
     * //   1 ---|"colleagues"| 2
     * ```
     *
     * @example
     * ```ts
     * import * as Graph from "effect/Graph"
     *
     * // Advanced styling with node shapes for flowchart
     * const workflow = Graph.directed<{ type: string; name: string }, string>(
     *   (mutable) => {
     *     const start = Graph.addNode(mutable, { type: "start", name: "Begin" })
     *     const process = Graph.addNode(mutable, {
     *       type: "process",
     *       name: "Process Data"
     *     })
     *     const decision = Graph.addNode(mutable, {
     *       type: "decision",
     *       name: "Valid?"
     *     })
     *     const end = Graph.addNode(mutable, { type: "end", name: "Complete" })
     *     Graph.addEdge(mutable, start, process, "")
     *     Graph.addEdge(mutable, process, decision, "")
     *     Graph.addEdge(mutable, decision, end, "yes")
     *   }
     * )
     *
     * const mermaid = Graph.toMermaid(workflow, {
     *   nodeLabel: (node) => node.name,
     *   nodeShape: (node) => {
     *     switch (node.type) {
     *       case "start":
     *         return "stadium"
     *       case "process":
     *         return "rectangle"
     *       case "decision":
     *         return "diamond"
     *       case "end":
     *         return "stadium"
     *       default:
     *         return "rectangle"
     *     }
     *   }
     * })
     * console.log(mermaid)
     * // flowchart TD
     * //   0(["Begin"])
     * //   1["Process Data"]
     * //   2{"Valid?"}
     * //   3(["Complete"])
     * //   0 --> 1
     * //   1 --> 2
     * //   2 --> 3
     * ```
     *
     * @example
     * ```ts
     * import * as Graph from "effect/Graph"
     *
     * // Real-world example: Software dependency graph
     * interface Dependency {
     *   name: string
     *   version: string
     *   type: "library" | "framework" | "tool"
     * }
     *
     * const dependencyGraph = Graph.directed<Dependency, string>((mutable) => {
     *   const app = Graph.addNode(mutable, {
     *     name: "MyApp",
     *     version: "1.0.0",
     *     type: "library"
     *   })
     *   const react = Graph.addNode(mutable, {
     *     name: "React",
     *     version: "18.0.0",
     *     type: "framework"
     *   })
     *   const lodash = Graph.addNode(mutable, {
     *     name: "Lodash",
     *     version: "4.17.0",
     *     type: "library"
     *   })
     *   const webpack = Graph.addNode(mutable, {
     *     name: "Webpack",
     *     version: "5.0.0",
     *     type: "tool"
     *   })
     *
     *   Graph.addEdge(mutable, app, react, "depends on")
     *   Graph.addEdge(mutable, app, lodash, "depends on")
     *   Graph.addEdge(mutable, app, webpack, "builds with")
     * })
     *
     * const dependencyDiagram = Graph.toMermaid(dependencyGraph, {
     *   nodeLabel: (dep) => `${dep.name}\\nv${dep.version}`,
     *   edgeLabel: (edge) => edge,
     *   nodeShape: (dep) =>
     *     dep.type === "framework" ?
     *       "hexagon" :
     *       dep.type === "tool"
     *       ? "diamond"
     *       : "rectangle",
     *   direction: "TB"
     * })
     *
     * console.log(dependencyDiagram)
     * // flowchart TB
     * //   0["MyApp\nv1.0.0"]
     * //   1{{"React\nv18.0.0"}}
     * //   2["Lodash\nv4.17.0"]
     * //   3{"Webpack\nv5.0.0"}
     * //   0 -->|"depends on"| 1
     * //   0 -->|"depends on"| 2
     * //   0 -->|"builds with"| 3
     * ```
     *
     * @param graph - The graph to export (directed or undirected)
     * @param options - Optional configuration for the Mermaid output
     * @returns Mermaid diagram syntax as a string
     *
     * @since 4.0.0
     * @category utils
     */
    <N, E>(options?: MermaidOptions<N, E>): <T extends Kind = "directed">(graph: Graph<N, E, T> | MutableGraph<N, E, T>) => string;
    /**
     * Exports a graph to Mermaid diagram format for visualization.
     *
     * Mermaid is a popular diagram-as-code tool that generates flowcharts and other
     * visualizations from text-based definitions. This function converts Effect Graph
     * structures to valid Mermaid syntax for use in documentation, web applications,
     * and visualization tools.
     *
     * @example
     * ```ts
     * import * as Graph from "effect/Graph"
     *
     * // Basic directed graph export
     * const graph = Graph.directed<string, number>((mutable) => {
     *   const app = Graph.addNode(mutable, "App")
     *   const db = Graph.addNode(mutable, "Database")
     *   const cache = Graph.addNode(mutable, "Cache")
     *   Graph.addEdge(mutable, app, db, 1)
     *   Graph.addEdge(mutable, app, cache, 2)
     * })
     *
     * const mermaid = Graph.toMermaid(graph)
     * console.log(mermaid)
     * // flowchart TD
     * //   0["App"]
     * //   1["Database"]
     * //   2["Cache"]
     * //   0 -->|"1"| 1
     * //   0 -->|"2"| 2
     * ```
     *
     * @example
     * ```ts
     * import * as Graph from "effect/Graph"
     *
     * // Undirected graph with custom labels and direction
     * const socialGraph = Graph.undirected<{ name: string }, string>((mutable) => {
     *   const alice = Graph.addNode(mutable, { name: "Alice" })
     *   const bob = Graph.addNode(mutable, { name: "Bob" })
     *   const charlie = Graph.addNode(mutable, { name: "Charlie" })
     *   Graph.addEdge(mutable, alice, bob, "friends")
     *   Graph.addEdge(mutable, bob, charlie, "colleagues")
     * })
     *
     * const mermaid = Graph.toMermaid(socialGraph, {
     *   nodeLabel: (person) => person.name,
     *   edgeLabel: (relationship) => relationship,
     *   direction: "LR"
     * })
     * console.log(mermaid)
     * // graph LR
     * //   0["Alice"]
     * //   1["Bob"]
     * //   2["Charlie"]
     * //   0 ---|"friends"| 1
     * //   1 ---|"colleagues"| 2
     * ```
     *
     * @example
     * ```ts
     * import * as Graph from "effect/Graph"
     *
     * // Advanced styling with node shapes for flowchart
     * const workflow = Graph.directed<{ type: string; name: string }, string>(
     *   (mutable) => {
     *     const start = Graph.addNode(mutable, { type: "start", name: "Begin" })
     *     const process = Graph.addNode(mutable, {
     *       type: "process",
     *       name: "Process Data"
     *     })
     *     const decision = Graph.addNode(mutable, {
     *       type: "decision",
     *       name: "Valid?"
     *     })
     *     const end = Graph.addNode(mutable, { type: "end", name: "Complete" })
     *     Graph.addEdge(mutable, start, process, "")
     *     Graph.addEdge(mutable, process, decision, "")
     *     Graph.addEdge(mutable, decision, end, "yes")
     *   }
     * )
     *
     * const mermaid = Graph.toMermaid(workflow, {
     *   nodeLabel: (node) => node.name,
     *   nodeShape: (node) => {
     *     switch (node.type) {
     *       case "start":
     *         return "stadium"
     *       case "process":
     *         return "rectangle"
     *       case "decision":
     *         return "diamond"
     *       case "end":
     *         return "stadium"
     *       default:
     *         return "rectangle"
     *     }
     *   }
     * })
     * console.log(mermaid)
     * // flowchart TD
     * //   0(["Begin"])
     * //   1["Process Data"]
     * //   2{"Valid?"}
     * //   3(["Complete"])
     * //   0 --> 1
     * //   1 --> 2
     * //   2 --> 3
     * ```
     *
     * @example
     * ```ts
     * import * as Graph from "effect/Graph"
     *
     * // Real-world example: Software dependency graph
     * interface Dependency {
     *   name: string
     *   version: string
     *   type: "library" | "framework" | "tool"
     * }
     *
     * const dependencyGraph = Graph.directed<Dependency, string>((mutable) => {
     *   const app = Graph.addNode(mutable, {
     *     name: "MyApp",
     *     version: "1.0.0",
     *     type: "library"
     *   })
     *   const react = Graph.addNode(mutable, {
     *     name: "React",
     *     version: "18.0.0",
     *     type: "framework"
     *   })
     *   const lodash = Graph.addNode(mutable, {
     *     name: "Lodash",
     *     version: "4.17.0",
     *     type: "library"
     *   })
     *   const webpack = Graph.addNode(mutable, {
     *     name: "Webpack",
     *     version: "5.0.0",
     *     type: "tool"
     *   })
     *
     *   Graph.addEdge(mutable, app, react, "depends on")
     *   Graph.addEdge(mutable, app, lodash, "depends on")
     *   Graph.addEdge(mutable, app, webpack, "builds with")
     * })
     *
     * const dependencyDiagram = Graph.toMermaid(dependencyGraph, {
     *   nodeLabel: (dep) => `${dep.name}\\nv${dep.version}`,
     *   edgeLabel: (edge) => edge,
     *   nodeShape: (dep) =>
     *     dep.type === "framework" ?
     *       "hexagon" :
     *       dep.type === "tool"
     *       ? "diamond"
     *       : "rectangle",
     *   direction: "TB"
     * })
     *
     * console.log(dependencyDiagram)
     * // flowchart TB
     * //   0["MyApp\nv1.0.0"]
     * //   1{{"React\nv18.0.0"}}
     * //   2["Lodash\nv4.17.0"]
     * //   3{"Webpack\nv5.0.0"}
     * //   0 -->|"depends on"| 1
     * //   0 -->|"depends on"| 2
     * //   0 -->|"builds with"| 3
     * ```
     *
     * @param graph - The graph to export (directed or undirected)
     * @param options - Optional configuration for the Mermaid output
     * @returns Mermaid diagram syntax as a string
     *
     * @since 4.0.0
     * @category utils
     */
    <N, E, T extends Kind = "directed">(graph: Graph<N, E, T> | MutableGraph<N, E, T>, options?: MermaidOptions<N, E>): string;
};
/**
 * Direction for graph traversal, indicating which edges to follow.
 *
 * @example
 * ```ts
 * import { Graph } from "effect"
 *
 * const graph = Graph.directed<string, string>((mutable) => {
 *   const a = Graph.addNode(mutable, "A")
 *   const b = Graph.addNode(mutable, "B")
 *   Graph.addEdge(mutable, a, b, "A->B")
 * })
 *
 * // Follow outgoing edges (normal direction)
 * const outgoingNodes = Array.from(
 *   Graph.indices(Graph.dfs(graph, { start: [0], direction: "outgoing" }))
 * )
 *
 * // Follow incoming edges (reverse direction)
 * const incomingNodes = Array.from(
 *   Graph.indices(Graph.dfs(graph, { start: [1], direction: "incoming" }))
 * )
 * ```
 *
 * @since 4.0.0
 * @category models
 */
export type Direction = "outgoing" | "incoming";
/**
 * Checks if the graph is acyclic (contains no cycles).
 *
 * Uses depth-first search to detect back edges, which indicate cycles.
 * For directed graphs, any back edge creates a cycle. For undirected graphs,
 * a back edge that doesn't go to the immediate parent creates a cycle.
 *
 * @example
 * ```ts
 * import { Graph } from "effect"
 *
 * // Acyclic directed graph (DAG)
 * const dag = Graph.directed<string, string>((mutable) => {
 *   const a = Graph.addNode(mutable, "A")
 *   const b = Graph.addNode(mutable, "B")
 *   const c = Graph.addNode(mutable, "C")
 *   Graph.addEdge(mutable, a, b, "A->B")
 *   Graph.addEdge(mutable, b, c, "B->C")
 * })
 * console.log(Graph.isAcyclic(dag)) // true
 *
 * // Cyclic directed graph
 * const cyclic = Graph.directed<string, string>((mutable) => {
 *   const a = Graph.addNode(mutable, "A")
 *   const b = Graph.addNode(mutable, "B")
 *   Graph.addEdge(mutable, a, b, "A->B")
 *   Graph.addEdge(mutable, b, a, "B->A") // Creates cycle
 * })
 * console.log(Graph.isAcyclic(cyclic)) // false
 * ```
 *
 * @since 4.0.0
 * @category algorithms
 */
export declare const isAcyclic: <N, E, T extends Kind = "directed">(graph: Graph<N, E, T> | MutableGraph<N, E, T>) => boolean;
/**
 * Checks if an undirected graph is bipartite.
 *
 * A bipartite graph is one whose vertices can be divided into two disjoint sets
 * such that no two vertices within the same set are adjacent. Uses BFS coloring
 * to determine bipartiteness.
 *
 * @example
 * ```ts
 * import { Graph } from "effect"
 *
 * // Bipartite graph (alternating coloring possible)
 * const bipartite = Graph.undirected<string, string>((mutable) => {
 *   const a = Graph.addNode(mutable, "A")
 *   const b = Graph.addNode(mutable, "B")
 *   const c = Graph.addNode(mutable, "C")
 *   const d = Graph.addNode(mutable, "D")
 *   Graph.addEdge(mutable, a, b, "edge") // Set 1: {A, C}, Set 2: {B, D}
 *   Graph.addEdge(mutable, b, c, "edge")
 *   Graph.addEdge(mutable, c, d, "edge")
 * })
 * console.log(Graph.isBipartite(bipartite)) // true
 *
 * // Non-bipartite graph (odd cycle)
 * const triangle = Graph.undirected<string, string>((mutable) => {
 *   const a = Graph.addNode(mutable, "A")
 *   const b = Graph.addNode(mutable, "B")
 *   const c = Graph.addNode(mutable, "C")
 *   Graph.addEdge(mutable, a, b, "edge")
 *   Graph.addEdge(mutable, b, c, "edge")
 *   Graph.addEdge(mutable, c, a, "edge") // Triangle (3-cycle)
 * })
 * console.log(Graph.isBipartite(triangle)) // false
 * ```
 *
 * @since 4.0.0
 * @category algorithms
 */
export declare const isBipartite: <N, E>(graph: Graph<N, E, "undirected"> | MutableGraph<N, E, "undirected">) => boolean;
/**
 * Find connected components in an undirected graph.
 * Each component is represented as an array of node indices.
 *
 * @example
 * ```ts
 * import { Graph } from "effect"
 *
 * const graph = Graph.undirected<string, string>((mutable) => {
 *   const a = Graph.addNode(mutable, "A")
 *   const b = Graph.addNode(mutable, "B")
 *   const c = Graph.addNode(mutable, "C")
 *   const d = Graph.addNode(mutable, "D")
 *   Graph.addEdge(mutable, a, b, "edge") // Component 1: A-B
 *   Graph.addEdge(mutable, c, d, "edge") // Component 2: C-D
 * })
 *
 * const components = Graph.connectedComponents(graph)
 * console.log(components) // [[0, 1], [2, 3]]
 * ```
 *
 * @since 4.0.0
 * @category algorithms
 */
export declare const connectedComponents: <N, E>(graph: Graph<N, E, "undirected"> | MutableGraph<N, E, "undirected">) => Array<Array<NodeIndex>>;
/**
 * Find strongly connected components in a directed graph using Kosaraju's algorithm.
 * Each SCC is represented as an array of node indices.
 *
 * @example
 * ```ts
 * import { Graph } from "effect"
 *
 * const graph = Graph.directed<string, string>((mutable) => {
 *   const a = Graph.addNode(mutable, "A")
 *   const b = Graph.addNode(mutable, "B")
 *   const c = Graph.addNode(mutable, "C")
 *   Graph.addEdge(mutable, a, b, "A->B")
 *   Graph.addEdge(mutable, b, c, "B->C")
 *   Graph.addEdge(mutable, c, a, "C->A") // Creates SCC: A-B-C
 * })
 *
 * const sccs = Graph.stronglyConnectedComponents(graph)
 * console.log(sccs) // [[0, 1, 2]]
 * ```
 *
 * @since 4.0.0
 * @category algorithms
 */
export declare const stronglyConnectedComponents: <N, E, T extends Kind = "directed">(graph: Graph<N, E, T> | MutableGraph<N, E, T>) => Array<Array<NodeIndex>>;
/**
 * Result of a shortest path computation containing the path and total distance.
 *
 * @since 4.0.0
 * @category models
 */
export interface PathResult<E> {
    readonly path: Array<NodeIndex>;
    readonly distance: number;
    readonly costs: Array<E>;
}
/**
 * Configuration for Dijkstra's algorithm.
 *
 * @since 4.0.0
 * @category models
 */
export interface DijkstraConfig<E> {
    source: NodeIndex;
    target: NodeIndex;
    cost: (edgeData: E) => number;
}
/**
 * Find the shortest path between two nodes using Dijkstra's algorithm.
 *
 * Dijkstra's algorithm works with non-negative edge weights and finds the shortest
 * path from a source node to a target node in O((V + E) log V) time complexity.
 *
 * @example
 * ```ts
 * import { Graph } from "effect"
 *
 * const graph = Graph.directed<string, number>((mutable) => {
 *   const a = Graph.addNode(mutable, "A")
 *   const b = Graph.addNode(mutable, "B")
 *   const c = Graph.addNode(mutable, "C")
 *   Graph.addEdge(mutable, a, b, 5)
 *   Graph.addEdge(mutable, a, c, 10)
 *   Graph.addEdge(mutable, b, c, 2)
 * })
 *
 * const result = Graph.dijkstra(graph, {
 *   source: 0,
 *   target: 2,
 *   cost: (edgeData) => edgeData
 * })
 *
 * if (result._tag === "Some") {
 *   console.log(result.value.path) // [0, 1, 2] - shortest path A->B->C
 *   console.log(result.value.distance) // 7 - total distance
 * }
 * ```
 *
 * @since 4.0.0
 * @category algorithms
 */
export declare const dijkstra: {
    /**
     * Find the shortest path between two nodes using Dijkstra's algorithm.
     *
     * Dijkstra's algorithm works with non-negative edge weights and finds the shortest
     * path from a source node to a target node in O((V + E) log V) time complexity.
     *
     * @example
     * ```ts
     * import { Graph } from "effect"
     *
     * const graph = Graph.directed<string, number>((mutable) => {
     *   const a = Graph.addNode(mutable, "A")
     *   const b = Graph.addNode(mutable, "B")
     *   const c = Graph.addNode(mutable, "C")
     *   Graph.addEdge(mutable, a, b, 5)
     *   Graph.addEdge(mutable, a, c, 10)
     *   Graph.addEdge(mutable, b, c, 2)
     * })
     *
     * const result = Graph.dijkstra(graph, {
     *   source: 0,
     *   target: 2,
     *   cost: (edgeData) => edgeData
     * })
     *
     * if (result._tag === "Some") {
     *   console.log(result.value.path) // [0, 1, 2] - shortest path A->B->C
     *   console.log(result.value.distance) // 7 - total distance
     * }
     * ```
     *
     * @since 4.0.0
     * @category algorithms
     */
    <E>(config: DijkstraConfig<E>): <N, T extends Kind = "directed">(graph: Graph<N, E, T> | MutableGraph<N, E, T>) => Option.Option<PathResult<E>>;
    /**
     * Find the shortest path between two nodes using Dijkstra's algorithm.
     *
     * Dijkstra's algorithm works with non-negative edge weights and finds the shortest
     * path from a source node to a target node in O((V + E) log V) time complexity.
     *
     * @example
     * ```ts
     * import { Graph } from "effect"
     *
     * const graph = Graph.directed<string, number>((mutable) => {
     *   const a = Graph.addNode(mutable, "A")
     *   const b = Graph.addNode(mutable, "B")
     *   const c = Graph.addNode(mutable, "C")
     *   Graph.addEdge(mutable, a, b, 5)
     *   Graph.addEdge(mutable, a, c, 10)
     *   Graph.addEdge(mutable, b, c, 2)
     * })
     *
     * const result = Graph.dijkstra(graph, {
     *   source: 0,
     *   target: 2,
     *   cost: (edgeData) => edgeData
     * })
     *
     * if (result._tag === "Some") {
     *   console.log(result.value.path) // [0, 1, 2] - shortest path A->B->C
     *   console.log(result.value.distance) // 7 - total distance
     * }
     * ```
     *
     * @since 4.0.0
     * @category algorithms
     */
    <N, E, T extends Kind = "directed">(graph: Graph<N, E, T> | MutableGraph<N, E, T>, config: DijkstraConfig<E>): Option.Option<PathResult<E>>;
};
/**
 * Result of all-pairs shortest path computation.
 *
 * @since 4.0.0
 * @category models
 */
export interface AllPairsResult<E> {
    readonly distances: Map<NodeIndex, Map<NodeIndex, number>>;
    readonly paths: Map<NodeIndex, Map<NodeIndex, Array<NodeIndex> | null>>;
    readonly costs: Map<NodeIndex, Map<NodeIndex, Array<E>>>;
}
/**
 * Find shortest paths between all pairs of nodes using Floyd-Warshall algorithm.
 *
 * Floyd-Warshall algorithm computes shortest paths between all pairs of nodes in O(V³) time.
 * It can handle negative edge weights and detect negative cycles.
 *
 * Throws if a negative cycle is detected that affects the path to target.
 *
 * @example
 * ```ts
 * import { Graph } from "effect"
 *
 * const graph = Graph.directed<string, number>((mutable) => {
 *   const a = Graph.addNode(mutable, "A")
 *   const b = Graph.addNode(mutable, "B")
 *   const c = Graph.addNode(mutable, "C")
 *   Graph.addEdge(mutable, a, b, 3)
 *   Graph.addEdge(mutable, b, c, 2)
 *   Graph.addEdge(mutable, a, c, 7)
 * })
 *
 * const result = Graph.floydWarshall(graph, (edgeData) => edgeData)
 * const distanceAToC = result.distances.get(0)?.get(2) // 5 (A->B->C)
 * const pathAToC = result.paths.get(0)?.get(2) // [0, 1, 2]
 * ```
 *
 * @since 4.0.0
 * @category algorithms
 */
export declare const floydWarshall: {
    /**
     * Find shortest paths between all pairs of nodes using Floyd-Warshall algorithm.
     *
     * Floyd-Warshall algorithm computes shortest paths between all pairs of nodes in O(V³) time.
     * It can handle negative edge weights and detect negative cycles.
     *
     * Throws if a negative cycle is detected that affects the path to target.
     *
     * @example
     * ```ts
     * import { Graph } from "effect"
     *
     * const graph = Graph.directed<string, number>((mutable) => {
     *   const a = Graph.addNode(mutable, "A")
     *   const b = Graph.addNode(mutable, "B")
     *   const c = Graph.addNode(mutable, "C")
     *   Graph.addEdge(mutable, a, b, 3)
     *   Graph.addEdge(mutable, b, c, 2)
     *   Graph.addEdge(mutable, a, c, 7)
     * })
     *
     * const result = Graph.floydWarshall(graph, (edgeData) => edgeData)
     * const distanceAToC = result.distances.get(0)?.get(2) // 5 (A->B->C)
     * const pathAToC = result.paths.get(0)?.get(2) // [0, 1, 2]
     * ```
     *
     * @since 4.0.0
     * @category algorithms
     */
    <E>(cost: (edgeData: E) => number): <N, T extends Kind = "directed">(graph: Graph<N, E, T> | MutableGraph<N, E, T>) => AllPairsResult<E>;
    /**
     * Find shortest paths between all pairs of nodes using Floyd-Warshall algorithm.
     *
     * Floyd-Warshall algorithm computes shortest paths between all pairs of nodes in O(V³) time.
     * It can handle negative edge weights and detect negative cycles.
     *
     * Throws if a negative cycle is detected that affects the path to target.
     *
     * @example
     * ```ts
     * import { Graph } from "effect"
     *
     * const graph = Graph.directed<string, number>((mutable) => {
     *   const a = Graph.addNode(mutable, "A")
     *   const b = Graph.addNode(mutable, "B")
     *   const c = Graph.addNode(mutable, "C")
     *   Graph.addEdge(mutable, a, b, 3)
     *   Graph.addEdge(mutable, b, c, 2)
     *   Graph.addEdge(mutable, a, c, 7)
     * })
     *
     * const result = Graph.floydWarshall(graph, (edgeData) => edgeData)
     * const distanceAToC = result.distances.get(0)?.get(2) // 5 (A->B->C)
     * const pathAToC = result.paths.get(0)?.get(2) // [0, 1, 2]
     * ```
     *
     * @since 4.0.0
     * @category algorithms
     */
    <N, E, T extends Kind = "directed">(graph: Graph<N, E, T> | MutableGraph<N, E, T>, cost: (edgeData: E) => number): AllPairsResult<E>;
};
/**
 * Configuration for A* pathfinding algorithm.
 *
 * @since 4.0.0
 * @category models
 */
export interface AstarConfig<E, N> {
    source: NodeIndex;
    target: NodeIndex;
    cost: (edgeData: E) => number;
    heuristic: (sourceNodeData: N, targetNodeData: N) => number;
}
/**
 * Find the shortest path between two nodes using A* pathfinding algorithm.
 *
 * A* is an extension of Dijkstra's algorithm that uses a heuristic function to guide
 * the search towards the target, potentially finding paths faster than Dijkstra's.
 * The heuristic must be admissible (never overestimate the actual cost).
 *
 * @example
 * ```ts
 * import { Graph } from "effect"
 *
 * const graph = Graph.directed<{ x: number; y: number }, number>((mutable) => {
 *   const a = Graph.addNode(mutable, { x: 0, y: 0 })
 *   const b = Graph.addNode(mutable, { x: 1, y: 0 })
 *   const c = Graph.addNode(mutable, { x: 2, y: 0 })
 *   Graph.addEdge(mutable, a, b, 1)
 *   Graph.addEdge(mutable, b, c, 1)
 * })
 *
 * // Manhattan distance heuristic
 * const heuristic = (
 *   nodeData: { x: number; y: number },
 *   targetData: { x: number; y: number }
 * ) => Math.abs(nodeData.x - targetData.x) + Math.abs(nodeData.y - targetData.y)
 *
 * const result = Graph.astar(graph, {
 *   source: 0,
 *   target: 2,
 *   cost: (edgeData) => edgeData,
 *   heuristic
 * })
 *
 * if (result._tag === "Some") {
 *   console.log(result.value.path) // [0, 1, 2] - shortest path
 *   console.log(result.value.distance) // 2 - total distance
 * }
 * ```
 *
 * @since 4.0.0
 * @category algorithms
 */
export declare const astar: {
    /**
     * Find the shortest path between two nodes using A* pathfinding algorithm.
     *
     * A* is an extension of Dijkstra's algorithm that uses a heuristic function to guide
     * the search towards the target, potentially finding paths faster than Dijkstra's.
     * The heuristic must be admissible (never overestimate the actual cost).
     *
     * @example
     * ```ts
     * import { Graph } from "effect"
     *
     * const graph = Graph.directed<{ x: number; y: number }, number>((mutable) => {
     *   const a = Graph.addNode(mutable, { x: 0, y: 0 })
     *   const b = Graph.addNode(mutable, { x: 1, y: 0 })
     *   const c = Graph.addNode(mutable, { x: 2, y: 0 })
     *   Graph.addEdge(mutable, a, b, 1)
     *   Graph.addEdge(mutable, b, c, 1)
     * })
     *
     * // Manhattan distance heuristic
     * const heuristic = (
     *   nodeData: { x: number; y: number },
     *   targetData: { x: number; y: number }
     * ) => Math.abs(nodeData.x - targetData.x) + Math.abs(nodeData.y - targetData.y)
     *
     * const result = Graph.astar(graph, {
     *   source: 0,
     *   target: 2,
     *   cost: (edgeData) => edgeData,
     *   heuristic
     * })
     *
     * if (result._tag === "Some") {
     *   console.log(result.value.path) // [0, 1, 2] - shortest path
     *   console.log(result.value.distance) // 2 - total distance
     * }
     * ```
     *
     * @since 4.0.0
     * @category algorithms
     */
    <E, N>(config: AstarConfig<E, N>): <T extends Kind = "directed">(graph: Graph<N, E, T> | MutableGraph<N, E, T>) => Option.Option<PathResult<E>>;
    /**
     * Find the shortest path between two nodes using A* pathfinding algorithm.
     *
     * A* is an extension of Dijkstra's algorithm that uses a heuristic function to guide
     * the search towards the target, potentially finding paths faster than Dijkstra's.
     * The heuristic must be admissible (never overestimate the actual cost).
     *
     * @example
     * ```ts
     * import { Graph } from "effect"
     *
     * const graph = Graph.directed<{ x: number; y: number }, number>((mutable) => {
     *   const a = Graph.addNode(mutable, { x: 0, y: 0 })
     *   const b = Graph.addNode(mutable, { x: 1, y: 0 })
     *   const c = Graph.addNode(mutable, { x: 2, y: 0 })
     *   Graph.addEdge(mutable, a, b, 1)
     *   Graph.addEdge(mutable, b, c, 1)
     * })
     *
     * // Manhattan distance heuristic
     * const heuristic = (
     *   nodeData: { x: number; y: number },
     *   targetData: { x: number; y: number }
     * ) => Math.abs(nodeData.x - targetData.x) + Math.abs(nodeData.y - targetData.y)
     *
     * const result = Graph.astar(graph, {
     *   source: 0,
     *   target: 2,
     *   cost: (edgeData) => edgeData,
     *   heuristic
     * })
     *
     * if (result._tag === "Some") {
     *   console.log(result.value.path) // [0, 1, 2] - shortest path
     *   console.log(result.value.distance) // 2 - total distance
     * }
     * ```
     *
     * @since 4.0.0
     * @category algorithms
     */
    <N, E, T extends Kind = "directed">(graph: Graph<N, E, T> | MutableGraph<N, E, T>, config: AstarConfig<E, N>): Option.Option<PathResult<E>>;
};
/**
 * Configuration for Bellman-Ford algorithm.
 *
 * @since 4.0.0
 * @category models
 */
export interface BellmanFordConfig<E> {
    source: NodeIndex;
    target: NodeIndex;
    cost: (edgeData: E) => number;
}
/**
 * Find the shortest path between two nodes using Bellman-Ford algorithm.
 *
 * Bellman-Ford algorithm can handle negative edge weights and detects negative cycles.
 * It has O(VE) time complexity, slower than Dijkstra's but more versatile.
 * Returns Option.none() if a negative cycle is detected that affects the path.
 *
 * @example
 * ```ts
 * import { Graph } from "effect"
 *
 * const graph = Graph.directed<string, number>((mutable) => {
 *   const a = Graph.addNode(mutable, "A")
 *   const b = Graph.addNode(mutable, "B")
 *   const c = Graph.addNode(mutable, "C")
 *   Graph.addEdge(mutable, a, b, -1) // Negative weight allowed
 *   Graph.addEdge(mutable, b, c, 3)
 *   Graph.addEdge(mutable, a, c, 5)
 * })
 *
 * const result = Graph.bellmanFord(graph, {
 *   source: 0,
 *   target: 2,
 *   cost: (edgeData) => edgeData
 * })
 *
 * if (result._tag === "Some") {
 *   console.log(result.value.path) // [0, 1, 2] - shortest path A->B->C
 *   console.log(result.value.distance) // 2 - total distance
 * }
 * ```
 *
 * @since 4.0.0
 * @category algorithms
 */
export declare const bellmanFord: {
    /**
     * Find the shortest path between two nodes using Bellman-Ford algorithm.
     *
     * Bellman-Ford algorithm can handle negative edge weights and detects negative cycles.
     * It has O(VE) time complexity, slower than Dijkstra's but more versatile.
     * Returns Option.none() if a negative cycle is detected that affects the path.
     *
     * @example
     * ```ts
     * import { Graph } from "effect"
     *
     * const graph = Graph.directed<string, number>((mutable) => {
     *   const a = Graph.addNode(mutable, "A")
     *   const b = Graph.addNode(mutable, "B")
     *   const c = Graph.addNode(mutable, "C")
     *   Graph.addEdge(mutable, a, b, -1) // Negative weight allowed
     *   Graph.addEdge(mutable, b, c, 3)
     *   Graph.addEdge(mutable, a, c, 5)
     * })
     *
     * const result = Graph.bellmanFord(graph, {
     *   source: 0,
     *   target: 2,
     *   cost: (edgeData) => edgeData
     * })
     *
     * if (result._tag === "Some") {
     *   console.log(result.value.path) // [0, 1, 2] - shortest path A->B->C
     *   console.log(result.value.distance) // 2 - total distance
     * }
     * ```
     *
     * @since 4.0.0
     * @category algorithms
     */
    <E>(config: BellmanFordConfig<E>): <N, T extends Kind = "directed">(graph: Graph<N, E, T> | MutableGraph<N, E, T>) => Option.Option<PathResult<E>>;
    /**
     * Find the shortest path between two nodes using Bellman-Ford algorithm.
     *
     * Bellman-Ford algorithm can handle negative edge weights and detects negative cycles.
     * It has O(VE) time complexity, slower than Dijkstra's but more versatile.
     * Returns Option.none() if a negative cycle is detected that affects the path.
     *
     * @example
     * ```ts
     * import { Graph } from "effect"
     *
     * const graph = Graph.directed<string, number>((mutable) => {
     *   const a = Graph.addNode(mutable, "A")
     *   const b = Graph.addNode(mutable, "B")
     *   const c = Graph.addNode(mutable, "C")
     *   Graph.addEdge(mutable, a, b, -1) // Negative weight allowed
     *   Graph.addEdge(mutable, b, c, 3)
     *   Graph.addEdge(mutable, a, c, 5)
     * })
     *
     * const result = Graph.bellmanFord(graph, {
     *   source: 0,
     *   target: 2,
     *   cost: (edgeData) => edgeData
     * })
     *
     * if (result._tag === "Some") {
     *   console.log(result.value.path) // [0, 1, 2] - shortest path A->B->C
     *   console.log(result.value.distance) // 2 - total distance
     * }
     * ```
     *
     * @since 4.0.0
     * @category algorithms
     */
    <N, E, T extends Kind = "directed">(graph: Graph<N, E, T> | MutableGraph<N, E, T>, config: BellmanFordConfig<E>): Option.Option<PathResult<E>>;
};
/**
 * Concrete class for iterables that produce [NodeIndex, NodeData] tuples.
 *
 * This class provides a common abstraction for all iterables that return node data,
 * including traversal iterators (DFS, BFS, etc.) and element iterators (nodes, externals).
 * It uses a mapEntry function pattern for flexible iteration and transformation.
 *
 * @example
 * ```ts
 * import { Graph } from "effect"
 *
 * const graph = Graph.directed<string, number>((mutable) => {
 *   const a = Graph.addNode(mutable, "A")
 *   const b = Graph.addNode(mutable, "B")
 *   Graph.addEdge(mutable, a, b, 1)
 * })
 *
 * // Both traversal and element iterators return NodeWalker
 * const dfsNodes: Graph.NodeWalker<string> = Graph.dfs(graph, { start: [0] })
 * const allNodes: Graph.NodeWalker<string> = Graph.nodes(graph)
 *
 * // Common interface for working with node iterables
 * function processNodes<N>(nodeIterable: Graph.NodeWalker<N>): Array<number> {
 *   return Array.from(Graph.indices(nodeIterable))
 * }
 *
 * // Access node data using values() or entries()
 * const nodeData = Array.from(Graph.values(dfsNodes)) // ["A", "B"]
 * const nodeEntries = Array.from(Graph.entries(allNodes)) // [[0, "A"], [1, "B"]]
 * ```
 *
 * @since 4.0.0
 * @category models
 */
export declare class Walker<T, N> implements Iterable<[T, N]> {
    readonly [Symbol.iterator]: () => Iterator<[T, N]>;
    /**
     * Visits each element and maps it to a value using the provided function.
     *
     * Takes a function that receives the index and data,
     * and returns an iterable of the mapped values. Skips elements that
     * no longer exist in the graph.
     *
     * @example
     * ```ts
     * import { Graph } from "effect"
     *
     * const graph = Graph.directed<string, number>((mutable) => {
     *   const a = Graph.addNode(mutable, "A")
     *   const b = Graph.addNode(mutable, "B")
     *   Graph.addEdge(mutable, a, b, 1)
     * })
     *
     * const dfs = Graph.dfs(graph, { start: [0] })
     *
     * // Map to just the node data
     * const values = Array.from(dfs.visit((index, data) => data))
     * console.log(values) // ["A", "B"]
     *
     * // Map to custom objects
     * const custom = Array.from(
     *   dfs.visit((index, data) => ({ id: index, name: data }))
     * )
     * console.log(custom) // [{ id: 0, name: "A" }, { id: 1, name: "B" }]
     * ```
     *
     * @since 4.0.0
     * @category iterators
     */
    readonly visit: <U>(f: (index: T, data: N) => U) => Iterable<U>;
    constructor(
    /**
     * Visits each element and maps it to a value using the provided function.
     *
     * Takes a function that receives the index and data,
     * and returns an iterable of the mapped values. Skips elements that
     * no longer exist in the graph.
     *
     * @example
     * ```ts
     * import { Graph } from "effect"
     *
     * const graph = Graph.directed<string, number>((mutable) => {
     *   const a = Graph.addNode(mutable, "A")
     *   const b = Graph.addNode(mutable, "B")
     *   Graph.addEdge(mutable, a, b, 1)
     * })
     *
     * const dfs = Graph.dfs(graph, { start: [0] })
     *
     * // Map to just the node data
     * const values = Array.from(dfs.visit((index, data) => data))
     * console.log(values) // ["A", "B"]
     *
     * // Map to custom objects
     * const custom = Array.from(
     *   dfs.visit((index, data) => ({ id: index, name: data }))
     * )
     * console.log(custom) // [{ id: 0, name: "A" }, { id: 1, name: "B" }]
     * ```
     *
     * @since 4.0.0
     * @category iterators
     */
    visit: <U>(f: (index: T, data: N) => U) => Iterable<U>);
}
/**
 * Type alias for node iteration using Walker.
 * NodeWalker is represented as Walker<NodeIndex, N>.
 *
 * @since 4.0.0
 * @category models
 */
export type NodeWalker<N> = Walker<NodeIndex, N>;
/**
 * Type alias for edge iteration using Walker.
 * EdgeWalker is represented as Walker<EdgeIndex, Edge<E>>.
 *
 * @since 4.0.0
 * @category models
 */
export type EdgeWalker<E> = Walker<EdgeIndex, Edge<E>>;
/**
 * Returns an iterator over the indices in the walker.
 *
 * @example
 * ```ts
 * import { Graph } from "effect"
 *
 * const graph = Graph.directed<string, number>((mutable) => {
 *   const a = Graph.addNode(mutable, "A")
 *   const b = Graph.addNode(mutable, "B")
 *   Graph.addEdge(mutable, a, b, 1)
 * })
 *
 * const dfs = Graph.dfs(graph, { start: [0] })
 * const indices = Array.from(Graph.indices(dfs))
 * console.log(indices) // [0, 1]
 * ```
 *
 * @since 4.0.0
 * @category utilities
 */
export declare const indices: <T, N>(walker: Walker<T, N>) => Iterable<T>;
/**
 * Returns an iterator over the values (data) in the walker.
 *
 * @example
 * ```ts
 * import { Graph } from "effect"
 *
 * const graph = Graph.directed<string, number>((mutable) => {
 *   const a = Graph.addNode(mutable, "A")
 *   const b = Graph.addNode(mutable, "B")
 *   Graph.addEdge(mutable, a, b, 1)
 * })
 *
 * const dfs = Graph.dfs(graph, { start: [0] })
 * const values = Array.from(Graph.values(dfs))
 * console.log(values) // ["A", "B"]
 * ```
 *
 * @since 4.0.0
 * @category utilities
 */
export declare const values: <T, N>(walker: Walker<T, N>) => Iterable<N>;
/**
 * Returns an iterator over [index, data] entries in the walker.
 *
 * @example
 * ```ts
 * import { Graph } from "effect"
 *
 * const graph = Graph.directed<string, number>((mutable) => {
 *   const a = Graph.addNode(mutable, "A")
 *   const b = Graph.addNode(mutable, "B")
 *   Graph.addEdge(mutable, a, b, 1)
 * })
 *
 * const dfs = Graph.dfs(graph, { start: [0] })
 * const entries = Array.from(Graph.entries(dfs))
 * console.log(entries) // [[0, "A"], [1, "B"]]
 * ```
 *
 * @since 4.0.0
 * @category utilities
 */
export declare const entries: <T, N>(walker: Walker<T, N>) => Iterable<[T, N]>;
/**
 * Configuration options for search iterators.
 *
 * @since 4.0.0
 * @category models
 */
export interface SearchConfig {
    readonly start?: Array<NodeIndex>;
    readonly direction?: Direction;
}
/**
 * Creates a new DFS iterator with optional configuration.
 *
 * The iterator maintains a stack of nodes to visit and tracks discovered nodes.
 * It provides lazy evaluation of the depth-first search.
 *
 * @example
 * ```ts
 * import { Graph } from "effect"
 *
 * const graph = Graph.directed<string, number>((mutable) => {
 *   const a = Graph.addNode(mutable, "A")
 *   const b = Graph.addNode(mutable, "B")
 *   const c = Graph.addNode(mutable, "C")
 *   Graph.addEdge(mutable, a, b, 1)
 *   Graph.addEdge(mutable, b, c, 1)
 * })
 *
 * // Start from a specific node
 * const dfs1 = Graph.dfs(graph, { start: [0] })
 * for (const nodeIndex of Graph.indices(dfs1)) {
 *   console.log(nodeIndex) // Traverses in DFS order: 0, 1, 2
 * }
 *
 * // Empty iterator (no starting nodes)
 * const dfs2 = Graph.dfs(graph)
 * // Can be used programmatically
 * ```
 *
 * @since 4.0.0
 * @category iterators
 */
export declare const dfs: {
    /**
     * Creates a new DFS iterator with optional configuration.
     *
     * The iterator maintains a stack of nodes to visit and tracks discovered nodes.
     * It provides lazy evaluation of the depth-first search.
     *
     * @example
     * ```ts
     * import { Graph } from "effect"
     *
     * const graph = Graph.directed<string, number>((mutable) => {
     *   const a = Graph.addNode(mutable, "A")
     *   const b = Graph.addNode(mutable, "B")
     *   const c = Graph.addNode(mutable, "C")
     *   Graph.addEdge(mutable, a, b, 1)
     *   Graph.addEdge(mutable, b, c, 1)
     * })
     *
     * // Start from a specific node
     * const dfs1 = Graph.dfs(graph, { start: [0] })
     * for (const nodeIndex of Graph.indices(dfs1)) {
     *   console.log(nodeIndex) // Traverses in DFS order: 0, 1, 2
     * }
     *
     * // Empty iterator (no starting nodes)
     * const dfs2 = Graph.dfs(graph)
     * // Can be used programmatically
     * ```
     *
     * @since 4.0.0
     * @category iterators
     */
    (config?: SearchConfig): <N, E, T extends Kind = "directed">(graph: Graph<N, E, T> | MutableGraph<N, E, T>) => NodeWalker<N>;
    /**
     * Creates a new DFS iterator with optional configuration.
     *
     * The iterator maintains a stack of nodes to visit and tracks discovered nodes.
     * It provides lazy evaluation of the depth-first search.
     *
     * @example
     * ```ts
     * import { Graph } from "effect"
     *
     * const graph = Graph.directed<string, number>((mutable) => {
     *   const a = Graph.addNode(mutable, "A")
     *   const b = Graph.addNode(mutable, "B")
     *   const c = Graph.addNode(mutable, "C")
     *   Graph.addEdge(mutable, a, b, 1)
     *   Graph.addEdge(mutable, b, c, 1)
     * })
     *
     * // Start from a specific node
     * const dfs1 = Graph.dfs(graph, { start: [0] })
     * for (const nodeIndex of Graph.indices(dfs1)) {
     *   console.log(nodeIndex) // Traverses in DFS order: 0, 1, 2
     * }
     *
     * // Empty iterator (no starting nodes)
     * const dfs2 = Graph.dfs(graph)
     * // Can be used programmatically
     * ```
     *
     * @since 4.0.0
     * @category iterators
     */
    <N, E, T extends Kind = "directed">(graph: Graph<N, E, T> | MutableGraph<N, E, T>, config?: SearchConfig): NodeWalker<N>;
};
/**
 * Creates a new BFS iterator with optional configuration.
 *
 * The iterator maintains a queue of nodes to visit and tracks discovered nodes.
 * It provides lazy evaluation of the breadth-first search.
 *
 * @example
 * ```ts
 * import { Graph } from "effect"
 *
 * const graph = Graph.directed<string, number>((mutable) => {
 *   const a = Graph.addNode(mutable, "A")
 *   const b = Graph.addNode(mutable, "B")
 *   const c = Graph.addNode(mutable, "C")
 *   Graph.addEdge(mutable, a, b, 1)
 *   Graph.addEdge(mutable, b, c, 1)
 * })
 *
 * // Start from a specific node
 * const bfs1 = Graph.bfs(graph, { start: [0] })
 * for (const nodeIndex of Graph.indices(bfs1)) {
 *   console.log(nodeIndex) // Traverses in BFS order: 0, 1, 2
 * }
 *
 * // Empty iterator (no starting nodes)
 * const bfs2 = Graph.bfs(graph)
 * // Can be used programmatically
 * ```
 *
 * @since 4.0.0
 * @category iterators
 */
export declare const bfs: {
    /**
     * Creates a new BFS iterator with optional configuration.
     *
     * The iterator maintains a queue of nodes to visit and tracks discovered nodes.
     * It provides lazy evaluation of the breadth-first search.
     *
     * @example
     * ```ts
     * import { Graph } from "effect"
     *
     * const graph = Graph.directed<string, number>((mutable) => {
     *   const a = Graph.addNode(mutable, "A")
     *   const b = Graph.addNode(mutable, "B")
     *   const c = Graph.addNode(mutable, "C")
     *   Graph.addEdge(mutable, a, b, 1)
     *   Graph.addEdge(mutable, b, c, 1)
     * })
     *
     * // Start from a specific node
     * const bfs1 = Graph.bfs(graph, { start: [0] })
     * for (const nodeIndex of Graph.indices(bfs1)) {
     *   console.log(nodeIndex) // Traverses in BFS order: 0, 1, 2
     * }
     *
     * // Empty iterator (no starting nodes)
     * const bfs2 = Graph.bfs(graph)
     * // Can be used programmatically
     * ```
     *
     * @since 4.0.0
     * @category iterators
     */
    (config?: SearchConfig): <N, E, T extends Kind = "directed">(graph: Graph<N, E, T> | MutableGraph<N, E, T>) => NodeWalker<N>;
    /**
     * Creates a new BFS iterator with optional configuration.
     *
     * The iterator maintains a queue of nodes to visit and tracks discovered nodes.
     * It provides lazy evaluation of the breadth-first search.
     *
     * @example
     * ```ts
     * import { Graph } from "effect"
     *
     * const graph = Graph.directed<string, number>((mutable) => {
     *   const a = Graph.addNode(mutable, "A")
     *   const b = Graph.addNode(mutable, "B")
     *   const c = Graph.addNode(mutable, "C")
     *   Graph.addEdge(mutable, a, b, 1)
     *   Graph.addEdge(mutable, b, c, 1)
     * })
     *
     * // Start from a specific node
     * const bfs1 = Graph.bfs(graph, { start: [0] })
     * for (const nodeIndex of Graph.indices(bfs1)) {
     *   console.log(nodeIndex) // Traverses in BFS order: 0, 1, 2
     * }
     *
     * // Empty iterator (no starting nodes)
     * const bfs2 = Graph.bfs(graph)
     * // Can be used programmatically
     * ```
     *
     * @since 4.0.0
     * @category iterators
     */
    <N, E, T extends Kind = "directed">(graph: Graph<N, E, T> | MutableGraph<N, E, T>, config?: SearchConfig): NodeWalker<N>;
};
/**
 * Configuration options for topological sort iterator.
 *
 * @since 4.0.0
 * @category models
 */
export interface TopoConfig {
    readonly initials?: Array<NodeIndex>;
}
/**
 * Creates a new topological sort iterator with optional configuration.
 *
 * The iterator uses Kahn's algorithm to lazily produce nodes in topological order.
 * Throws an error if the graph contains cycles.
 *
 * @example
 * ```ts
 * import { Graph } from "effect"
 *
 * const graph = Graph.directed<string, number>((mutable) => {
 *   const a = Graph.addNode(mutable, "A")
 *   const b = Graph.addNode(mutable, "B")
 *   const c = Graph.addNode(mutable, "C")
 *   Graph.addEdge(mutable, a, b, 1)
 *   Graph.addEdge(mutable, b, c, 1)
 * })
 *
 * // Standard topological sort
 * const topo1 = Graph.topo(graph)
 * for (const nodeIndex of Graph.indices(topo1)) {
 *   console.log(nodeIndex) // 0, 1, 2 (topological order)
 * }
 *
 * // With initial nodes
 * const topo2 = Graph.topo(graph, { initials: [0] })
 *
 * // Throws error for cyclic graph
 * const cyclicGraph = Graph.directed<string, number>((mutable) => {
 *   const a = Graph.addNode(mutable, "A")
 *   const b = Graph.addNode(mutable, "B")
 *   Graph.addEdge(mutable, a, b, 1)
 *   Graph.addEdge(mutable, b, a, 2) // Creates cycle
 * })
 *
 * try {
 *   Graph.topo(cyclicGraph) // Throws: "Cannot perform topological sort on cyclic graph"
 * } catch (error) {
 *   console.log((error as Error).message)
 * }
 * ```
 *
 * @since 4.0.0
 * @category iterators
 */
export declare const topo: {
    /**
     * Creates a new topological sort iterator with optional configuration.
     *
     * The iterator uses Kahn's algorithm to lazily produce nodes in topological order.
     * Throws an error if the graph contains cycles.
     *
     * @example
     * ```ts
     * import { Graph } from "effect"
     *
     * const graph = Graph.directed<string, number>((mutable) => {
     *   const a = Graph.addNode(mutable, "A")
     *   const b = Graph.addNode(mutable, "B")
     *   const c = Graph.addNode(mutable, "C")
     *   Graph.addEdge(mutable, a, b, 1)
     *   Graph.addEdge(mutable, b, c, 1)
     * })
     *
     * // Standard topological sort
     * const topo1 = Graph.topo(graph)
     * for (const nodeIndex of Graph.indices(topo1)) {
     *   console.log(nodeIndex) // 0, 1, 2 (topological order)
     * }
     *
     * // With initial nodes
     * const topo2 = Graph.topo(graph, { initials: [0] })
     *
     * // Throws error for cyclic graph
     * const cyclicGraph = Graph.directed<string, number>((mutable) => {
     *   const a = Graph.addNode(mutable, "A")
     *   const b = Graph.addNode(mutable, "B")
     *   Graph.addEdge(mutable, a, b, 1)
     *   Graph.addEdge(mutable, b, a, 2) // Creates cycle
     * })
     *
     * try {
     *   Graph.topo(cyclicGraph) // Throws: "Cannot perform topological sort on cyclic graph"
     * } catch (error) {
     *   console.log((error as Error).message)
     * }
     * ```
     *
     * @since 4.0.0
     * @category iterators
     */
    (config?: TopoConfig): <N, E, T extends Kind = "directed">(graph: Graph<N, E, T> | MutableGraph<N, E, T>) => NodeWalker<N>;
    /**
     * Creates a new topological sort iterator with optional configuration.
     *
     * The iterator uses Kahn's algorithm to lazily produce nodes in topological order.
     * Throws an error if the graph contains cycles.
     *
     * @example
     * ```ts
     * import { Graph } from "effect"
     *
     * const graph = Graph.directed<string, number>((mutable) => {
     *   const a = Graph.addNode(mutable, "A")
     *   const b = Graph.addNode(mutable, "B")
     *   const c = Graph.addNode(mutable, "C")
     *   Graph.addEdge(mutable, a, b, 1)
     *   Graph.addEdge(mutable, b, c, 1)
     * })
     *
     * // Standard topological sort
     * const topo1 = Graph.topo(graph)
     * for (const nodeIndex of Graph.indices(topo1)) {
     *   console.log(nodeIndex) // 0, 1, 2 (topological order)
     * }
     *
     * // With initial nodes
     * const topo2 = Graph.topo(graph, { initials: [0] })
     *
     * // Throws error for cyclic graph
     * const cyclicGraph = Graph.directed<string, number>((mutable) => {
     *   const a = Graph.addNode(mutable, "A")
     *   const b = Graph.addNode(mutable, "B")
     *   Graph.addEdge(mutable, a, b, 1)
     *   Graph.addEdge(mutable, b, a, 2) // Creates cycle
     * })
     *
     * try {
     *   Graph.topo(cyclicGraph) // Throws: "Cannot perform topological sort on cyclic graph"
     * } catch (error) {
     *   console.log((error as Error).message)
     * }
     * ```
     *
     * @since 4.0.0
     * @category iterators
     */
    <N, E, T extends Kind = "directed">(graph: Graph<N, E, T> | MutableGraph<N, E, T>, config?: TopoConfig): NodeWalker<N>;
};
/**
 * Creates a new DFS postorder iterator with optional configuration.
 *
 * The iterator maintains a stack with visit state tracking and emits nodes
 * in postorder (after all descendants have been processed). Essential for
 * dependency resolution and tree destruction algorithms.
 *
 * @example
 * ```ts
 * import { Graph } from "effect"
 *
 * const graph = Graph.directed<string, number>((mutable) => {
 *   const root = Graph.addNode(mutable, "root")
 *   const child1 = Graph.addNode(mutable, "child1")
 *   const child2 = Graph.addNode(mutable, "child2")
 *   Graph.addEdge(mutable, root, child1, 1)
 *   Graph.addEdge(mutable, root, child2, 1)
 * })
 *
 * // Postorder: children before parents
 * const postOrder = Graph.dfsPostOrder(graph, { start: [0] })
 * for (const node of postOrder) {
 *   console.log(node) // 1, 2, 0
 * }
 * ```
 *
 * @since 4.0.0
 * @category iterators
 */
export declare const dfsPostOrder: {
    /**
     * Creates a new DFS postorder iterator with optional configuration.
     *
     * The iterator maintains a stack with visit state tracking and emits nodes
     * in postorder (after all descendants have been processed). Essential for
     * dependency resolution and tree destruction algorithms.
     *
     * @example
     * ```ts
     * import { Graph } from "effect"
     *
     * const graph = Graph.directed<string, number>((mutable) => {
     *   const root = Graph.addNode(mutable, "root")
     *   const child1 = Graph.addNode(mutable, "child1")
     *   const child2 = Graph.addNode(mutable, "child2")
     *   Graph.addEdge(mutable, root, child1, 1)
     *   Graph.addEdge(mutable, root, child2, 1)
     * })
     *
     * // Postorder: children before parents
     * const postOrder = Graph.dfsPostOrder(graph, { start: [0] })
     * for (const node of postOrder) {
     *   console.log(node) // 1, 2, 0
     * }
     * ```
     *
     * @since 4.0.0
     * @category iterators
     */
    (config?: SearchConfig): <N, E, T extends Kind = "directed">(graph: Graph<N, E, T> | MutableGraph<N, E, T>) => NodeWalker<N>;
    /**
     * Creates a new DFS postorder iterator with optional configuration.
     *
     * The iterator maintains a stack with visit state tracking and emits nodes
     * in postorder (after all descendants have been processed). Essential for
     * dependency resolution and tree destruction algorithms.
     *
     * @example
     * ```ts
     * import { Graph } from "effect"
     *
     * const graph = Graph.directed<string, number>((mutable) => {
     *   const root = Graph.addNode(mutable, "root")
     *   const child1 = Graph.addNode(mutable, "child1")
     *   const child2 = Graph.addNode(mutable, "child2")
     *   Graph.addEdge(mutable, root, child1, 1)
     *   Graph.addEdge(mutable, root, child2, 1)
     * })
     *
     * // Postorder: children before parents
     * const postOrder = Graph.dfsPostOrder(graph, { start: [0] })
     * for (const node of postOrder) {
     *   console.log(node) // 1, 2, 0
     * }
     * ```
     *
     * @since 4.0.0
     * @category iterators
     */
    <N, E, T extends Kind = "directed">(graph: Graph<N, E, T> | MutableGraph<N, E, T>, config?: SearchConfig): NodeWalker<N>;
};
/**
 * Creates an iterator over all node indices in the graph.
 *
 * The iterator produces node indices in the order they were added to the graph.
 * This provides access to all nodes regardless of connectivity.
 *
 * @example
 * ```ts
 * import { Graph } from "effect"
 *
 * const graph = Graph.directed<string, number>((mutable) => {
 *   const a = Graph.addNode(mutable, "A")
 *   const b = Graph.addNode(mutable, "B")
 *   const c = Graph.addNode(mutable, "C")
 *   Graph.addEdge(mutable, a, b, 1)
 * })
 *
 * const indices = Array.from(Graph.indices(Graph.nodes(graph)))
 * console.log(indices) // [0, 1, 2]
 * ```
 *
 * @since 4.0.0
 * @category iterators
 */
export declare const nodes: <N, E, T extends Kind = "directed">(graph: Graph<N, E, T> | MutableGraph<N, E, T>) => NodeWalker<N>;
/**
 * Creates an iterator over all edge indices in the graph.
 *
 * The iterator produces edge indices in the order they were added to the graph.
 * This provides access to all edges regardless of connectivity.
 *
 * @example
 * ```ts
 * import { Graph } from "effect"
 *
 * const graph = Graph.directed<string, number>((mutable) => {
 *   const a = Graph.addNode(mutable, "A")
 *   const b = Graph.addNode(mutable, "B")
 *   const c = Graph.addNode(mutable, "C")
 *   Graph.addEdge(mutable, a, b, 1)
 *   Graph.addEdge(mutable, b, c, 2)
 * })
 *
 * const indices = Array.from(Graph.indices(Graph.edges(graph)))
 * console.log(indices) // [0, 1]
 * ```
 *
 * @since 4.0.0
 * @category iterators
 */
export declare const edges: <N, E, T extends Kind = "directed">(graph: Graph<N, E, T> | MutableGraph<N, E, T>) => EdgeWalker<E>;
/**
 * Configuration for externals iterator.
 *
 * @since 4.0.0
 * @category models
 */
export interface ExternalsConfig {
    readonly direction?: Direction;
}
/**
 * Creates an iterator over external nodes (nodes without edges in specified direction).
 *
 * External nodes are nodes that have no outgoing edges (direction="outgoing") or
 * no incoming edges (direction="incoming"). These are useful for finding
 * sources, sinks, or isolated nodes.
 *
 * @example
 * ```ts
 * import { Graph } from "effect"
 *
 * const graph = Graph.directed<string, number>((mutable) => {
 *   const source = Graph.addNode(mutable, "source") // 0 - no incoming
 *   const middle = Graph.addNode(mutable, "middle") // 1 - has both
 *   const sink = Graph.addNode(mutable, "sink") // 2 - no outgoing
 *   const isolated = Graph.addNode(mutable, "isolated") // 3 - no edges
 *
 *   Graph.addEdge(mutable, source, middle, 1)
 *   Graph.addEdge(mutable, middle, sink, 2)
 * })
 *
 * // Nodes with no outgoing edges (sinks + isolated)
 * const sinks = Array.from(
 *   Graph.indices(Graph.externals(graph, { direction: "outgoing" }))
 * )
 * console.log(sinks) // [2, 3]
 *
 * // Nodes with no incoming edges (sources + isolated)
 * const sources = Array.from(
 *   Graph.indices(Graph.externals(graph, { direction: "incoming" }))
 * )
 * console.log(sources) // [0, 3]
 * ```
 *
 * @since 4.0.0
 * @category iterators
 */
export declare const externals: {
    /**
     * Creates an iterator over external nodes (nodes without edges in specified direction).
     *
     * External nodes are nodes that have no outgoing edges (direction="outgoing") or
     * no incoming edges (direction="incoming"). These are useful for finding
     * sources, sinks, or isolated nodes.
     *
     * @example
     * ```ts
     * import { Graph } from "effect"
     *
     * const graph = Graph.directed<string, number>((mutable) => {
     *   const source = Graph.addNode(mutable, "source") // 0 - no incoming
     *   const middle = Graph.addNode(mutable, "middle") // 1 - has both
     *   const sink = Graph.addNode(mutable, "sink") // 2 - no outgoing
     *   const isolated = Graph.addNode(mutable, "isolated") // 3 - no edges
     *
     *   Graph.addEdge(mutable, source, middle, 1)
     *   Graph.addEdge(mutable, middle, sink, 2)
     * })
     *
     * // Nodes with no outgoing edges (sinks + isolated)
     * const sinks = Array.from(
     *   Graph.indices(Graph.externals(graph, { direction: "outgoing" }))
     * )
     * console.log(sinks) // [2, 3]
     *
     * // Nodes with no incoming edges (sources + isolated)
     * const sources = Array.from(
     *   Graph.indices(Graph.externals(graph, { direction: "incoming" }))
     * )
     * console.log(sources) // [0, 3]
     * ```
     *
     * @since 4.0.0
     * @category iterators
     */
    (config?: ExternalsConfig): <N, E, T extends Kind = "directed">(graph: Graph<N, E, T> | MutableGraph<N, E, T>) => NodeWalker<N>;
    /**
     * Creates an iterator over external nodes (nodes without edges in specified direction).
     *
     * External nodes are nodes that have no outgoing edges (direction="outgoing") or
     * no incoming edges (direction="incoming"). These are useful for finding
     * sources, sinks, or isolated nodes.
     *
     * @example
     * ```ts
     * import { Graph } from "effect"
     *
     * const graph = Graph.directed<string, number>((mutable) => {
     *   const source = Graph.addNode(mutable, "source") // 0 - no incoming
     *   const middle = Graph.addNode(mutable, "middle") // 1 - has both
     *   const sink = Graph.addNode(mutable, "sink") // 2 - no outgoing
     *   const isolated = Graph.addNode(mutable, "isolated") // 3 - no edges
     *
     *   Graph.addEdge(mutable, source, middle, 1)
     *   Graph.addEdge(mutable, middle, sink, 2)
     * })
     *
     * // Nodes with no outgoing edges (sinks + isolated)
     * const sinks = Array.from(
     *   Graph.indices(Graph.externals(graph, { direction: "outgoing" }))
     * )
     * console.log(sinks) // [2, 3]
     *
     * // Nodes with no incoming edges (sources + isolated)
     * const sources = Array.from(
     *   Graph.indices(Graph.externals(graph, { direction: "incoming" }))
     * )
     * console.log(sources) // [0, 3]
     * ```
     *
     * @since 4.0.0
     * @category iterators
     */
    <N, E, T extends Kind = "directed">(graph: Graph<N, E, T> | MutableGraph<N, E, T>, config?: ExternalsConfig): NodeWalker<N>;
};
export {};
//# sourceMappingURL=Graph.d.ts.map