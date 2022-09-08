CREATE MATERIALIZED VIEW mledb.v_current_elo_values_nigel AS
WITH all_leaf_nodes AS (SELECT player_id, elo, chain, id
                            FROM mledb.elo_data
                            WHERE next_node_id IS NULL),
     leaf_chains    AS (SELECT MAX(chain) AS chain, player_id
                            FROM mledb.elo_data
                            GROUP BY player_id),
     leaf_nodes     AS (SELECT all_leaf_nodes.id, all_leaf_nodes.player_id
                            FROM all_leaf_nodes
                                     INNER JOIN leaf_chains ON leaf_chains.player_id = all_leaf_nodes.player_id AND
                                                               leaf_chains.chain = all_leaf_nodes.chain
                            GROUP BY all_leaf_nodes.id, all_leaf_nodes.player_id)
SELECT player_id, elo, p.league, salary, p.name
    FROM mledb.elo_data ed
             INNER JOIN mledb.player p ON p.id = player_id
    WHERE ed.id IN (SELECT id FROM leaf_nodes)
ORDER BY player_id;




REFRESH MATERIALIZED VIEW mledb.v_current_elo_values