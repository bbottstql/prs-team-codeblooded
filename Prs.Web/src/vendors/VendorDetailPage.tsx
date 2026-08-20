import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { IVendor } from "./IVendor";
import { vendorAPI } from "./VendorAPI";
import { formatPhoneNumber } from "../utility/formatUtilities";

function VendorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [vendor, setVendor] = useState<IVendor>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadVendor() {
      try {
        const loadedVendor = await vendorAPI.find(Number(id));
        setVendor(loadedVendor);
      } catch (error: unknown) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Unable to load vendor details.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadVendor();
  }, [id]);

  if (loading) {
    return (
      <section className="content container-fluid mx-5 my-2 py-4">
        <p>Loading vendor...</p>
      </section>
    );
  }

  if (!vendor) {
    return (
      <section className="content container-fluid mx-5 my-2 py-4">
        <p>Unable to load vendor details.</p>
        <Link to="/vendors" className="btn btn-outline-primary">
          Back to vendors
        </Link>
      </section>
    );
  }

  const products = vendor.products ?? [];

  return (
    <section className="content container-fluid mx-5 my-2 py-4">
      <div className="d-flex justify-content-between pb-4 mb-4 border-bottom border-2">
        <h2>{vendor.name}</h2>
        <Link to="/vendors" className="btn btn-outline-primary">
          Back to vendors
        </Link>
      </div>

      <dl className="row w-75">
        <dt className="col-sm-3">Vendor code</dt>
        <dd className="col-sm-9">{vendor.code}</dd>
        <dt className="col-sm-3">Address</dt>
        <dd className="col-sm-9">{vendor.address}</dd>
        <dt className="col-sm-3">City, state, ZIP</dt>
        <dd className="col-sm-9">
          {vendor.city}, {vendor.state} {vendor.zip}
        </dd>
        <dt className="col-sm-3">Phone</dt>
        <dd className="col-sm-9">{formatPhoneNumber(vendor.phone)}</dd>
        <dt className="col-sm-3">Email</dt>
        <dd className="col-sm-9">{vendor.email}</dd>
      </dl>

      <div className="card p-4 mt-5">
        <h5 className="card-title">Products supplied</h5>
        {products.length === 0 ? (
          <p className="mb-0">This vendor does not supply any products.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Part number</th>
                <th>Name</th>
                <th>Price</th>
                <th>Unit</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>{product.partNumber}</td>
                  <td>{product.name}</td>
                  <td>
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                    }).format(product.price ?? 0)}
                  </td>
                  <td>{product.unit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}

export default VendorDetailPage;
