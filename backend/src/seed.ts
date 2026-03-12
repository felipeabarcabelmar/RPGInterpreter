import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando seeding de datos dummy...');

  // 1. Limpiar datos existentes
  await prisma.ticket.deleteMany({});
  await (prisma as any).rPGFile.deleteMany({});
  await prisma.category.deleteMany({});

  // 2. Crear Categorías
  const catVentas = await prisma.category.create({
    data: {
      name: 'Ventas y Facturación',
      description: 'Módulos encargados del procesamiento de órdenes, facturas y notas de crédito.'
    }
  });

  const catInventario = await prisma.category.create({
    data: {
      name: 'Gestión de Inventario',
      description: 'Control de stock, movimientos de almacén e integración con proveedores.'
    }
  });

  const catFinanzas = await prisma.category.create({
    data: {
      name: 'Contabilidad y Finanzas',
      description: 'Libro mayor, cuentas por cobrar/pagar y cierres mensuales.'
    }
  });

  // 3. Crear Archivos RPG Dummy
  await (prisma as any).rPGFile.create({
    data: {
      filename: 'ORDENTRA.RPG',
      categoryId: catVentas.id,
      content: `     H  DATEDIT(*DMY/)
     FORDERHDR  UF A E           K DISK
     FORDERDET  UF A E           K DISK
     D OrderDate       S               D   INZ(*SYS)
     C     *ENTRY        PLIST
     C                   PARM                    P_ORDERID        10
     C                   PARM                    P_CUSTID         10
     C* Proceso de creación de orden
     C                   EVAL      OH_ORDERID = P_ORDERID
     C                   EVAL      OH_CUSTID = P_CUSTID
     C                   EVAL      OH_DATE = OrderDate
     C                   WRITE     ORDREC
     C                   SETON                                        LR`,
      documentation: 'Programa de entrada de órdenes de trabajo. Registra la cabecera de la orden y valida el cliente.',
      businessLogic: '1. Recibe ID de orden y cliente.\n2. Obtiene la fecha del sistema.\n3. Inserta registro en la tabla maestra ORDERHDR.\n4. Libera bloqueos de base de datos.',
      mermaidDiagram: 'graph TD\n  A[Inicio] --> B{Validar Cliente}\n  B -- OK --> C[Obtener Fecha]\n  C --> D[Insertar ORDERHDR]\n  D --> E[Fin]\n  B -- Error --> F[Log Error]'
    }
  });

  await (prisma as any).rPGFile.create({
    data: {
      filename: 'STKUPD01.RPG',
      categoryId: catInventario.id,
      content: `     H  NOMAIN
     FSTKMAST   UF   E           K DISK
     C     UPDATE_STOCK  BEGSR
     C     ID            KLIST
     C                   KFLD                    STK_ID
     C     ID            CHAIN     STKREC
     C                   IF        %FOUND
     C                   EVAL      STK_QTY = STK_QTY + DELTA
     C                   UPDATE    STKREC
     C                   ENDIF
     C                   ENDSR`,
      documentation: 'Actualización masiva de stock físico tras recepción de mercadería.',
      businessLogic: 'Localiza el artículo mediante su ID en el maestro de stock y suma la cantidad recibida (DELTA) al inventario actual.',
      mermaidDiagram: 'sequenceDiagram\n  Almacén->>Sistema: Notifica Recepción\n  Sistema->>Master: CHAIN (ID)\n  Master-->>Sistema: Registro encontrado\n  Sistema->>Master: UPDATE (Qty + Delta)'
    }
  });

  await (prisma as any).rPGFile.create({
    data: {
      filename: 'CXC_REP.RPG',
      categoryId: catFinanzas.id,
      content: `     FCLIENTES  IF   E           K DISK
     FFAC_PEND  IF   E           K DISK
     C* Generación de reporte de cuentas por cobrar
     C     CL_ID         CHAIN     CLIENTEREC
     C     *IN99         DOWEQ     *OFF
     C                   EVAL      TOTAL_DEUDA = TOTAL_DEUDA + FP_SALDO
     C                   READ      FAC_PEND
     C                   ENDDO`,
      documentation: 'Reporte consolidado de deuda por cliente para gerencia financiera.',
      businessLogic: 'Recorre todas las facturas pendientes vinculadas a un cliente específico y acumula el saldo insoluto en una variable de control.',
      mermaidDiagram: 'stateDiagram-v2\n  [*] --> LecturaClientes\n  LecturaClientes --> CalculoDeuda\n  CalculoDeuda --> LecturaClientes: Siguiente Factura\n  CalculoDeuda --> ReporteFin: Cierre\n  ReporteFin --> [*]'
    }
  });

  // 4. Crear Tickets Dummy
  await prisma.ticket.create({
    data: {
      title: 'Error en cálculo de IVA - ORDENTRA',
      description: 'Se detectó que el programa ORDENTRA no está aplicando el redondeo correcto en el impuesto.',
      status: 'En Proceso',
      criticality: 'Alta'
    }
  });

  await prisma.ticket.create({
    data: {
      title: 'Solicitud de nuevo reporte trimestral',
      description: 'Finanzas solicita un reporte de ventas agrupado por región para el Q3.',
      status: 'Abierto',
      criticality: 'Media'
    }
  });

  await prisma.ticket.create({
    data: {
      title: 'Acceso denegado a STKUPD01',
      description: 'El usuario de bodega no puede ejecutar la actualización de stock.',
      status: 'Resuelto',
      criticality: 'Crítica',
      solution: 'Se actualizaron los permisos a nivel de objeto en el AS/400 para el perfil BODEGA_USR.'
    }
  });

  console.log('Seeding completado con éxito.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
