const fs = require('fs');

const files = [
  'src/app/api/brands/[id]/route.ts',
  'src/app/api/cafe/ingredients/[id]/route.ts',
  'src/app/api/cafe/ingredients/[id]/stock/route.ts',
  'src/app/api/cafe/menu-categories/[id]/route.ts',
  'src/app/api/cafe/menu-items/[id]/route.ts',
  'src/app/api/cafe/orders/[id]/route.ts',
  'src/app/api/categories/[id]/route.ts',
  'src/app/api/products/[id]/route.ts',
  'src/app/api/public/products/[id]/route.ts',
  'src/app/api/public/warranty/check/[serial]/route.ts',
  'src/app/api/sales/[id]/route.ts',
  'src/app/api/users/[id]/route.ts'
].map(f => __dirname + '/' + f);

files.forEach(f => {
  if(!fs.existsSync(f)) return;
  let cnt = fs.readFileSync(f, 'utf8');
  cnt = cnt.replace(/\{ params \}: \{ params: \{ ([a-zA-Z0-9_]+): string( \| undefined)?;? \} \}/g, '{ params }: { params: Promise<{ $1: string }> }');
  cnt = cnt.replace(/\{ params \}: Params/g, '{ params }: { params: Promise<{ id: string }> }');
  cnt = cnt.replace(/interface Params \{\s+params: \{ ([a-zA-Z0-9_]+): string(;|,) \};\s+\}/g, 'interface Params {\n    params: Promise<{ $1: string }>;\n}');
  cnt = cnt.replace(/params\.id/g, '(await params).id');
  cnt = cnt.replace(/params\.serial/g, '(await params).serial');
  fs.writeFileSync(f, cnt, 'utf8');
  console.log('Fixed ', f);
});
