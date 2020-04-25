CREATE TABLE report
(
	id_report SERIAL PRIMARY KEY NOT NULL,
    code_section CHARACTER VARYING,
    nombre DECIMAL(9,2),
    montant DECIMAL(15,2),
    dep CHARACTER VARYING,
    reg CHARACTER VARYING
)
TABLESPACE pg_default;