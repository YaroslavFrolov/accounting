export let getAllCountries = data => {
  let { DB } = data || {};

  if (!Array.isArray(DB)) {
    console.log('getAllCountries: calculateDeclaration - no DB');
  }

  let allCountries = {};

  let EURows = DB.filter(row=>row[8] === 'EU');

  EURows.forEach(row=>{
    let country = row[7];

    if(allCountries[country]) {
      return false;
    } else {
      allCountries[country] = 0;
    }
  });

  return allCountries;
};
