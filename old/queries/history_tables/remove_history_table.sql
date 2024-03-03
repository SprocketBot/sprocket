CREATE FUNCTION remove_history_table(target_table text) RETURNS void
    LANGUAGE plpgsql
AS
$$
BEGIN
    EXECUTE FORMAT('DROP TABLE history.%I CASCADE', target_table || '_history');
END;
$$;
