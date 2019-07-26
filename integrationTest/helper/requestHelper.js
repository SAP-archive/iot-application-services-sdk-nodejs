async function determineTenantPrefix(client) {
  const tenantInfo = await client.request({
    url: `${client.navigator.businessPartner()}/Tenants`
  });

  return tenantInfo.value[0].package;
}

async function deletePackageCascading(client, packageName) {
  const thingTypesResponse = await client.getThingTypesByPackage(packageName);
  const thingTypes = thingTypesResponse.d.results;
  for (const thingType of thingTypes) {
    const thingTypeResponse = await client.getThingType(thingType.Name, {}, { resolveWithFullResponse: true });
    const thingsResponse = await client.getThingsByThingType(thingType.Name);
    const things = thingsResponse.value;
    for (const thing of things) {
      await client.deleteThing(thing._id);
    }

    await client.deleteThingType(thingType.Name, thingTypeResponse.headers.etag);
  }

  const pstsResponse = await client.getPropertySetTypesByPackage(packageName);
  const psts = pstsResponse.d.results;
  psts.sort((a, b) => ((a.DataCategory === 'ReferencePropertyData') ? -1 : ((b.DataCategory === 'ReferencePropertyData') ? 1 : 0)));
  for (const pst of psts) {
    const pstResponse = await client.getPropertySetType(pst.Name, {}, { resolveWithFullResponse: true });
    await client.deletePropertySetType(pst.Name, pstResponse.headers.etag);
  }

  const packageResponse = await client.getPackage(packageName, { resolveWithFullResponse: true });
  await client.deletePackage(packageName, packageResponse.headers.etag);
}

module.exports = {
  determineTenantPrefix,
  deletePackageCascading
};
