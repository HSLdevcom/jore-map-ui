const textCodeList = {
    login_failed_no_jore_username:
        'Kirjautuminen epäonnistui, käyttäjänimeä ei löytynyt joukkoliikennerekisterin tietokannasta HSL-id:stä saadun sähköpostiosoitteen ${email} avulla.  Ota yhteyttä joukkoliikennerekisterin käyttäjätunnusten hallinnoijaan.',
    no_access_token:
        'Kirjautuminen epäonnistui, HSL-id:stä ei antanut access tokenia.',
    validation_error:
        'Tallennettavien tietojen validointi epäonnistui, Jore backendin antama virheviesti: ${errorMessage}',
    node_creation_coordinates_out_of_bounds:
        'Annettu geometria (lat ${lat}, lon ${lon}) on sallittujen rajojen (lat_min: ${lat_min} lat_max ${lat_max} lon_min ${lon_min} lon_max ${lon_max}) ulkopuolella.',
    local_area_distribution_fetch_failed:
        'Annetuilla koordinaateila (lat ${lat}, lon: ${lon}) ei löytynyt tietoja aluejako geojsonista solmun tunnuksen generointia varten.'
};

export default textCodeList;
